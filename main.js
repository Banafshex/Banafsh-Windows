const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const https = require('https');
const dns = require('dns').promises;
const { execFile } = require('child_process');

const CONN = 'Banafsh';
const SERVER_URLS = [
  'https://raw.githubusercontent.com/Banafshex/Banafsh-sstp/main/servers.json',
  'https://raw.githubusercontent.com/Banafshex/Banafsh-sstp/master/servers.json'
];
const SUBS = ['', 'www', 'pay', 'api', 'panel', 'my', 'app', 'm', 'login'];
const HOST_RE = /^[A-Za-z0-9.-]+$/;
const DEFAULTS = {
  lang: 'fa',
  autoReconnect: true,
  reconnectOnStart: false,
  reconnectDelay: 10,
  reconnectAttempts: 3,
  closeBehavior: 'ask'
};

let routes = [];
let win = null;
let tray = null;
let trayPopup = null;
let isQuitting = false;
let closePrompt = false;
let monitorTimer = null;
let reconnectTimer = null;
let reconnecting = false;
let lastKnownConnected = false;
let manualDisconnect = false;
let serverCache = [];
let healthCache = new Map();
let reconnectGeneration = 0;

const dataDir = process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('userData');
const SF = path.join(dataDir, 'banafsh-settings.json');
const LOGF = path.join(dataDir, 'banafsh.log');

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(SF, 'utf8')) }; }
  catch { return { ...DEFAULTS }; }
}
function saveSettings(s) {
  try { fs.writeFileSync(SF, JSON.stringify({ ...DEFAULTS, ...s }, null, 1)); } catch (e) { logMain('settings save failed: ' + e.message); }
}

const run = (file, args) => new Promise((res) =>
  execFile(file, args, { windowsHide: true, timeout: 60000 }, (e, out, err) =>
    res({ code: e ? (e.code || 1) : 0, out: String(out || ''), err: String(err || '') })));
const ps = (cmd) => run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', cmd]);

const getText = (u) => new Promise((res, rej) => {
  const req = https.get(u, { timeout: 15000 }, (r) => {
    if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
    let d = ''; r.setEncoding('utf8');
    r.on('data', (c) => (d += c));
    r.on('end', () => res(d));
  });
  req.on('error', rej);
  req.on('timeout', () => { req.destroy(new Error('timeout')); });
});

function normServers(raw) {
  const arr = Array.isArray(raw) ? raw : (raw.servers || raw.items || []);
  const seen = new Set(); const out = [];
  for (const s of arr) {
    const host = String(s.host || s.hostname || s.address || s.ip || '').trim();
    if (!host || !HOST_RE.test(host) || seen.has(host)) continue;
    const port = Number(s.port) || 443;
    if (port !== 443) continue;
    seen.add(host);
    const speed = Number(s.speed_mbps ?? s.speedMbps ?? s.speed ?? s.bandwidth_mbps ?? s.bandwidth ?? 0);
    const ping = Number(s.ping ?? s.latency ?? 0);
    out.push({
      host,
      port: 443,
      user: s.user || s.username || 'vpn',
      pass: s.pass || s.password || 'vpn',
      cc: String(s.cc || s.country_short || s.countryShort || s.country_code || s.countryCode || '').slice(0, 2).toUpperCase(),
      country: s.country_name || s.countryName || s.country || '',
      speedMbps: Number.isFinite(speed) ? speed : 0,
      ping: Number.isFinite(ping) ? ping : 0,
      sessions: Number(s.sessions) || 0,
      score: Number(s.score) || 0
    });
  }
  return out;
}

const tcp = (host, port = 443, ms = 4000) => new Promise((res) => {
  const t0 = Date.now();
  const s = net.connect({ host, port, timeout: ms });
  let done = false;
  const finish = (value) => { if (done) return; done = true; try { s.destroy(); } catch {} res(value); };
  s.once('connect', () => finish(Date.now() - t0));
  s.once('error', () => finish(-1));
  s.once('timeout', () => finish(-1));
});

async function getGateway() {
  const r = await ps(`Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Where-Object { $_.NextHop -ne '0.0.0.0' -and $_.InterfaceAlias -ne '${CONN}' } | Sort-Object RouteMetric | Select-Object -First 1 NextHop,InterfaceIndex | ConvertTo-Json`);
  try { const j = JSON.parse(r.out); return { hop: j.NextHop, idx: j.InterfaceIndex }; } catch { return null; }
}

async function resolveSites(sites) {
  const ips = new Set();
  const one = (name) => Promise.race([
    dns.resolve4(name),
    new Promise((_, rj) => setTimeout(() => rj(new Error('dns timeout')), 3000))
  ]).then((a) => a.forEach((i) => ips.add(i))).catch(() => {});
  const jobs = [];
  for (const s of sites) {
    if (!HOST_RE.test(s)) continue;
    for (const sub of SUBS) jobs.push(one(sub ? sub + '.' + s : s));
  }
  await Promise.all(jobs);
  return [...ips];
}

async function clearRoutes() {
  for (const ip of routes) await run('route', ['delete', ip]);
  routes = [];
}
async function disconnectAll() {
  await run('rasdial', [CONN, '/disconnect']);
  await clearRoutes();
}
async function isConnected() {
  const r = await ps(`(Get-VpnConnection -Name '${CONN}' -ErrorAction SilentlyContinue).ConnectionStatus`);
  return r.out.trim() === 'Connected';
}

function emitEvent(type, data = {}) {
  if (win && !win.isDestroyed()) win.webContents.send('vpn:event', { type, ...data });
  if (type === 'connected' || type === 'reconnected') lastKnownConnected = true;
  if (type === 'status' && typeof data.connected === 'boolean') lastKnownConnected = data.connected;
  if (type === 'connectionLost' || type === 'reconnectFailed' || type === 'connectionError') lastKnownConnected = false;
  updateTrayPopup();
}
function logMain(m) {
  try { fs.appendFileSync(LOGF, new Date().toISOString() + ' ' + m + '\n'); } catch {}
}

function rememberHealth(host, ms) {
  healthCache.set(host, { ok: ms > 0, ms, at: Date.now() });
}
function updateHealth(results) {
  for (const r of Array.isArray(results) ? results : []) {
    if (r && r.host) rememberHealth(r.host, Number(r.ms) || -1);
  }
}
function sortServers(arr) {
  const stateRank = (s) => s === 'ok' ? 0 : s === 'wait' ? 1 : 2;
  return [...arr].sort((a, b) =>
    stateRank(a.state) - stateRank(b.state) ||
    Number(b.speedMbps || 0) - Number(a.speedMbps || 0) ||
    Number(a.ms > 0 ? a.ms : Infinity) - Number(b.ms > 0 ? b.ms : Infinity) ||
    Number(a.ping || Infinity) - Number(b.ping || Infinity)
  );
}

async function connectVpn({ host, port = 443, user, pass, sites }) {
  port = 443;
  if (!HOST_RE.test(host)) return { ok: false, error: 'bad host' };
  manualDisconnect = false;
  await disconnectAll();
  const gw = await getGateway();
  const ips = await resolveSites(Array.isArray(sites) ? sites : []);
  const common = `-Name '${CONN}' -ServerAddress '${host}' -TunnelType Sstp -EncryptionLevel Required`;
  let r = await ps(`if (Get-VpnConnection -Name '${CONN}' -ErrorAction SilentlyContinue) { Set-VpnConnection ${common} -Force } else { Add-VpnConnection ${common} -AuthenticationMethod MSChapv2 -Force }`);
  if (r.code) return { ok: false, error: (r.err || r.out).trim() };
  r = await run('rasdial', [CONN, String(user || 'vpn'), String(pass || 'vpn')]);
  if (r.code) return { ok: false, error: (r.out + r.err).trim() };
  // A manual disconnect can happen while rasdial is still running. Never let a
  // late reconnect operation silently bring the VPN back after the user asked
  // to disconnect.
  if (manualDisconnect) {
    await disconnectAll();
    return { ok: false, error: 'cancelled' };
  }
  if (gw && gw.hop) {
    for (const ip of ips) {
      const x = await run('route', ['add', ip, 'mask', '255.255.255.255', gw.hop, 'if', String(gw.idx)]);
      if (!x.code) routes.push(ip);
    }
  }
  lastKnownConnected = true;
  emitEvent('connected', { host });
  return { ok: true, bypassed: routes.length, port };
}

function getSavedServer() {
  const s = loadSettings();
  const last = s.last;
  if (!last || !last.host || !HOST_RE.test(last.host)) return null;
  return { ...last, port: 443, user: last.user || 'vpn', pass: last.pass || 'vpn', sites: Array.isArray(s.sites) ? s.sites : [] };
}

async function connectSaved(serverOverride = null) {
  const last = serverOverride || getSavedServer();
  if (!last) return { ok: false, error: 'no saved server' };
  return connectVpn(last);
}

function scheduleReconnect(reason = '') {
  const s = loadSettings();
  if (manualDisconnect || s.autoReconnect === false || !getSavedServer() || reconnectTimer || reconnecting || isQuitting) return;
  const delay = Math.max(5, Number(s.reconnectDelay || 10)) * 1000;
  reconnectTimer = setTimeout(() => runReconnect(reason).catch(logErr), delay);
}

async function findFailoverServer(excluded) {
  const candidates = sortServers(serverCache.filter((x) => x && HOST_RE.test(x.host) && !excluded.has(x.host)));
  if (!candidates.length) return null;

  // Prefer servers already verified healthy by the renderer. If health is stale/missing,
  // probe a small number in parallel so failover does not turn into a long serial wait.
  const cached = candidates
    .map((s) => ({ s, h: healthCache.get(s.host) }))
    .filter((x) => x.h && x.h.ok && Date.now() - x.h.at < 10 * 60 * 1000)
    .sort((a, b) => Number(b.s.speedMbps || 0) - Number(a.s.speedMbps || 0) || Number(a.h.ms) - Number(b.h.ms));
  if (cached.length) return cached[0].s;

  const pool = candidates.slice(0, 12);
  const tested = await Promise.all(pool.map(async (s) => ({ s, ms: await tcp(s.host, s.port || 443) })));
  tested.forEach((x) => rememberHealth(x.s.host, x.ms));
  return tested.filter((x) => x.ms > 0)
    .sort((a, b) => Number(b.s.speedMbps || 0) - Number(a.s.speedMbps || 0) || a.ms - b.ms)[0]?.s || null;
}

async function runReconnect(reason = '') {
  if (manualDisconnect || isQuitting || reconnecting) return;
  reconnecting = true;
  reconnectTimer = null;
  const generation = ++reconnectGeneration;
  const s = loadSettings();
  const attempts = Math.max(1, Math.min(10, Number(s.reconnectAttempts || 3)));
  const delay = Math.max(5, Number(s.reconnectDelay || 10));
  const saved = getSavedServer();
  if (!saved) { reconnecting = false; return; }

  const tried = new Set();
  let current = saved;
  let switched = false;
  try {
    for (;;) {
      if (manualDisconnect || isQuitting || generation !== reconnectGeneration) return;
      tried.add(current.host);
      for (let attempt = 1; attempt <= attempts; attempt++) {
        if (manualDisconnect || isQuitting || generation !== reconnectGeneration) return;
        emitEvent('reconnecting', { attempt, attempts, host: current.host, switched });
        logMain(`reconnect attempt ${attempt}/${attempts}: ${current.host}${reason ? ' (' + reason + ')' : ''}`);
        const r = await connectSaved(current);
        if (r.ok) {
          const settings = loadSettings();
          saveSettings({ ...settings, last: { ...current } });
          emitEvent('reconnected', { host: current.host, switched });
          logMain('reconnected: ' + current.host);
          return;
        }
        logMain('reconnect failed: ' + (r.error || 'unknown'));
        if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      }

      emitEvent('switchingServer', {});
      const next = await findFailoverServer(tried);
      if (!next) {
        emitEvent('reconnectFailed', {});
        logMain('no healthy failover server found');
        return;
      }
      current = next;
      switched = true;
      reason = 'server failover';
    }
  } finally {
    reconnecting = false;
  }
}

function cancelReconnect() {
  reconnectGeneration++;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

function localizedTray() {
  const fa = loadSettings().lang === 'fa';
  return fa ? {
    connect: 'اتصال', disconnect: 'قطع اتصال', open: 'باز کردن', quit: 'خروج',
    connected: 'متصل', offline: 'قطع شده', connecting: 'در حال اتصال...'
  } : {
    connect: 'Connect', disconnect: 'Disconnect', open: 'Open', quit: 'Quit',
    connected: 'Connected', offline: 'Disconnected', connecting: 'Connecting...'
  };
}

function updateTrayPopup() {
  if (!trayPopup || trayPopup.isDestroyed()) return;
  const l = localizedTray();
  trayPopup.webContents.send('tray:state', { connected: !!lastKnownConnected, busy: reconnecting });
  trayPopup.setTitle(lastKnownConnected ? l.connected : l.offline);
  if (tray) tray.setToolTip(lastKnownConnected ? l.connected : l.offline);
}

function showTrayPopup() {
  if (!tray) return;
  if (trayPopup && !trayPopup.isDestroyed()) {
    trayPopup.show();
    updateTrayPopup();
    return;
  }
  const iconPath = path.join(__dirname, 'build', 'icon.png');
  trayPopup = new BrowserWindow({
    width: 230, height: 176, frame: false, transparent: true, resizable: false,
    skipTaskbar: true, alwaysOnTop: true, show: false, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  trayPopup.loadFile(path.join(__dirname, 'renderer', 'tray.html'));
  trayPopup.on('blur', () => { if (!trayPopup.isDestroyed()) trayPopup.hide(); });
  trayPopup.webContents.once('did-finish-load', () => {
    const b = tray.getBounds();
    const { screen } = require('electron');
    const display = screen.getDisplayNearestPoint({ x: b.x, y: b.y });
    const wa = display.workArea;
    const x = Math.max(wa.x + 8, Math.min(b.x + b.width - 230, wa.x + wa.width - 238));
    const y = Math.max(wa.y + 8, b.y - 184);
    trayPopup.setPosition(Math.round(x), Math.round(y), false);
    trayPopup.show();
    updateTrayPopup();
  });
}

function hideTrayPopup() {
  if (trayPopup && !trayPopup.isDestroyed()) trayPopup.hide();
}

function createTray() {
  if (tray) return;
  const iconPath = path.join(__dirname, 'build', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.on('click', showWindow);
  tray.on('double-click', showWindow);
  tray.on('right-click', showTrayPopup);
  updateTrayPopup();
}

ipcMain.handle('tray:action', async (_, action) => {
  hideTrayPopup();
  if (action === 'open') return showWindow();
  if (action === 'quit') return performQuit();
  if (action === 'toggle') {
    const c = await isConnected();
    if (c) {
      manualDisconnect = true;
      cancelReconnect();
      await disconnectAll();
      lastKnownConnected = false;
      emitEvent('status', { connected: false });
    } else {
      manualDisconnect = false;
      const r = await connectSaved();
      if (!r.ok) emitEvent('connectionError', { error: r.error });
    }
    updateTrayPopup();
  }
});

ipcMain.handle('window:close-choice', async (_, choice, remember) => {
  if (!win || win.isDestroyed()) return false;
  const s = loadSettings();
  if (remember && (choice === 'keep' || choice === 'quit')) saveSettings({ ...s, closeBehavior: choice });
  if (choice === 'keep') {
    closePrompt = false;
    win.hide();
    return true;
  }
  if (choice === 'quit') {
    await performQuit();
    return true;
  }
  closePrompt = false;
  return false;
});

ipcMain.handle('servers:load', async () => {
  let last;
  for (const u of SERVER_URLS) {
    try {
      const list = normServers(JSON.parse(await getText(u)));
      serverCache = list;
      return list;
    } catch (e) { last = e; }
  }
  throw last;
});
ipcMain.handle('servers:test', (_, host, port) => (HOST_RE.test(host) ? tcp(host, Number(port) || 443) : -1));
ipcMain.handle('servers:health', (_, results) => { updateHealth(results); return true; });
ipcMain.handle('settings:get', () => loadSettings());
ipcMain.handle('settings:set', (_, s) => { saveSettings(s); updateTrayPopup(); return true; });
ipcMain.handle('vpn:connect', async (_, opts) => connectVpn(opts));
ipcMain.handle('vpn:disconnect', async () => {
  manualDisconnect = true;
  cancelReconnect();
  await disconnectAll();
  lastKnownConnected = false;
  emitEvent('status', { connected: false });
  return true;
});
ipcMain.handle('vpn:status', async () => {
  const c = await isConnected();
  if (!c && routes.length) await clearRoutes();
  if (lastKnownConnected && !c && !manualDisconnect) scheduleReconnect('connection lost');
  lastKnownConnected = c;
  return c;
});

const logErr = (e) => logMain((e && e.stack) || e);
process.on('uncaughtException', (e) => { logErr(e); try { dialog.showErrorBox('Banafsh', String((e && e.message) || e)); } catch {} });
process.on('unhandledRejection', logErr);

const isAdmin = async () => (await run('whoami', ['/groups'])).out.includes('S-1-16-12288');
function relaunchAsAdmin() {
  const exe = process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;
  const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
  const extra = app.isPackaged ? '' : ' -ArgumentList ' + q(app.getAppPath());
  return ps(`Start-Process -FilePath ${q(exe)}${extra} -Verb RunAs`);
}

async function performQuit() {
  if (isQuitting) return;
  isQuitting = true;
  manualDisconnect = true;
  cancelReconnect();
  await disconnectAll();
  hideTrayPopup();
  app.quit();
}

function createWindow() {
  win = new BrowserWindow({
    width: 420, height: 760, useContentSize: true, resizable: false, maximizable: false,
    backgroundColor: '#17131f', title: 'Banafsh', icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.on('close', (e) => {
    if (isQuitting) return;
    e.preventDefault();
    if (closePrompt) return;
    const s = loadSettings();
    if (s.closeBehavior === 'keep') { win.hide(); return; }
    if (s.closeBehavior === 'quit') { performQuit().catch(logErr); return; }
    closePrompt = true;
    emitEvent('closeRequest', { connected: lastKnownConnected, lang: s.lang });
  });
}

function startMonitor() {
  clearInterval(monitorTimer);
  monitorTimer = setInterval(async () => {
    if (isQuitting) return;
    try {
      const c = await isConnected();
      if (lastKnownConnected && !c && !manualDisconnect) {
        emitEvent('connectionLost', {});
        scheduleReconnect('connection lost');
      }
      if (c && reconnecting) emitEvent('status', { connected: true });
      lastKnownConnected = c;
      updateTrayPopup();
    } catch (e) { logErr(e); }
  }, 5000);
}

app.whenReady().then(async () => {
  try {
    if (!(await isAdmin())) {
      const r = await relaunchAsAdmin();
      if (r.code) dialog.showErrorBox('Banafsh', 'برای کار کردن برنامه اجازه‌ی Administrator لازمه.\nThis app needs Administrator permission.');
      app.quit(); return;
    }
    if (!app.requestSingleInstanceLock()) { app.quit(); return; }
    app.on('second-instance', () => showWindow());
    createWindow();
    createTray();
    startMonitor();
    const s = loadSettings();
    if (s.reconnectOnStart && s.last) setTimeout(() => connectSaved().catch(logErr), 1200);
  } catch (e) { logErr(e); dialog.showErrorBox('Banafsh', String((e && e.message) || e)); app.quit(); }
});

app.on('window-all-closed', (e) => {
  // The tray owns the lifetime of the app. Closing the window is not quitting.
  if (!isQuitting) return;
  e.preventDefault();
});

app.on('before-quit', async (e) => {
  if (isQuitting) return;
  e.preventDefault();
  await performQuit();
});
