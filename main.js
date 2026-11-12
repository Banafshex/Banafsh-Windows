'use strict';

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Tray,
  Menu,
  Notification,
  nativeImage,
  nativeTheme,
  shell
} = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const { HOST_RE, testSstp, testL2tpIke, checkInternet } = require('./lib/probes');
const { encodeServer, decodeServer, makeQrSvg, serializeProfileJson, parseProfileJson } = require('./lib/qr');
const { fetchServersForProtocol, fetchServerHosts, qualityRank } = require('./lib/servers');
const { RELEASES_PAGE, isNewer, pickNotes, fetchLatestRelease, downloadReleaseAsset, parseNews, fetchNews } = require('./lib/updater');
const { DEFAULT_SITES } = require('./lib/bypass');
const { psQuote, ps, isAdmin, isConnected, clearBypassRoutes, syncBypassRoutesLive, disconnectAll, configureAndDial, createStatsSampler } = require('./lib/vpn-win');

const APP_VERSION = require('./package.json').version || '0.2.1';
const IS_PORTABLE = Boolean(process.env.PORTABLE_EXECUTABLE_FILE);

const DEFAULTS = {
  lang: 'fa',
  theme: 'system', // 'dark' | 'light' | 'system'
  protocol: 'l2tp', // 'l2tp' | 'sstp'
  last: null,
  profiles: {},
  customSitesEnabled: true,
  sites: null,
  autoReconnect: true,
  autoFailover: true,
  reconnectOnStart: false,
  reconnectDelay: 10,
  reconnectAttempts: 3,
  closeBehavior: 'ask',
  proxyEnabled: false,
  proxyHost: '',
  proxyPort: 8080,
  proxyUser: '',
  proxyPass: '',
  customDnsEnabled: false,
  customDns: '1.1.1.1',
  l2tpNatT: true,
  saveLogFile: true,
  welcomeSeen: false,
  lastSeenVersion: '',
  updateDismissedVersion: '',
  updateLastCheck: 0,
  updateFound: null,
  updateNotifiedVersion: '',
  newsCache: '',
  newsDismissedId: '',
  newsNotifiedId: ''
};

let win = null;
let tray = null;
let isQuitting = false;
let closePrompt = false;
let monitorTimer = null;
let backgroundNewsTimer = null;
let reconnectTimer = null;
let waitingNetTimer = null;
let reconnecting = false;
let waitingNetwork = false;
let connectingNow = false;
let lastKnownConnected = false;
let manualDisconnect = false;
let intentionalDisconnect = false;
let reconnectGeneration = 0;
let connectGeneration = 0;
let updateDownloadCancelled = false;

const serverCache = { l2tp: [], sstp: [] };
const healthCache = { l2tp: new Map(), sstp: new Map() };

let startupState = { percent: 0, text: 'در حال آماده‌سازی...' };

const dataDir = process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('userData');
const SF = path.join(dataDir, 'banafsh-settings.json');
const LOGF = path.join(dataDir, 'banafsh.log');
const ROUTE_STATE_FILE = path.join(dataDir, 'banafsh-active-routes.json');

const statsSampler = createStatsSampler((sample) => {
  if (lastKnownConnected && !isQuitting) {
    emitEvent('speed', sample);
  }
});

function loadSettings() {
  try {
    const parsed = JSON.parse(fs.readFileSync(SF, 'utf8'));
    const merged = { ...DEFAULTS, ...parsed };
    if (!Array.isArray(merged.sites)) merged.sites = [...DEFAULT_SITES];
    return merged;
  } catch {
    return { ...DEFAULTS, sites: [...DEFAULT_SITES] };
  }
}

function saveSettings(partial) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const current = loadSettings();
    const merged = { ...DEFAULTS, ...current, ...partial };
    fs.writeFileSync(SF, JSON.stringify(merged, null, 2));
    return merged;
  } catch (e) {
    logMain('settings save failed: ' + e.message);
    return loadSettings();
  }
}

function patchSettings(partial) {
  const merged = saveSettings(partial);
  emitEvent('settings', { settings: merged });
  return merged;
}

function logMain(msg) {
  const line = new Date().toISOString() + ' ' + String(msg || '');
  try {
    const s = loadSettings();
    if (s.saveLogFile !== false) {
      fs.mkdirSync(dataDir, { recursive: true });
      fs.appendFileSync(LOGF, line + '\n');
    }
  } catch {}
  if (win && !win.isDestroyed()) {
    try { win.webContents.send('vpn:event', { type: 'log', line }); } catch {}
  }
}

const logErr = (e) => logMain((e && (e.stack || e.message)) || String(e));

function startupProgress(percent, text = '') {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  startupState = { percent: p, text: text || startupState.text };
  if (win && !win.isDestroyed() && win.webContents && !win.webContents.isDestroyed()) {
    try { win.webContents.send('startup:progress', startupState); } catch {}
  }
}

function emitEvent(type, data = {}) {
  if (win && !win.isDestroyed()) {
    try { win.webContents.send('vpn:event', { type, ...data }); } catch {}
  }
  if (type === 'connected' || type === 'reconnected') {
    lastKnownConnected = true;
    waitingNetwork = false;
    statsSampler.start();
  }
  if (type === 'status' && typeof data.connected === 'boolean') {
    lastKnownConnected = data.connected;
    if (data.connected) statsSampler.start();
    else statsSampler.stop();
  }
  if (type === 'connectionLost' || type === 'reconnectFailed' || type === 'connectionError') {
    lastKnownConnected = false;
    statsSampler.stop();
  }
  refreshTrayMenu().catch(() => {});
}

function normProtocol(p) {
  return p === 'sstp' ? 'sstp' : 'l2tp';
}

function rememberHealth(protocol, host, ms) {
  const proto = normProtocol(protocol);
  if (!host) return;
  healthCache[proto].set(host, { ok: ms > 0, ms: Number(ms) || -1, at: Date.now() });
}

function updateHealth(protocol, results) {
  const proto = normProtocol(protocol);
  for (const r of Array.isArray(results) ? results : []) {
    if (r && r.host) rememberHealth(proto, r.host, Number(r.ms) || -1);
  }
}

async function probeServer(protocol, server) {
  const proto = normProtocol(protocol);
  if (!server || !server.host || !HOST_RE.test(server.host)) return -1;
  const ms = proto === 'l2tp'
    ? await testL2tpIke(server.host, server.ip || '')
    : await testSstp(server.host, Number(server.port) || 443);
  rememberHealth(proto, server.host, ms);
  return ms;
}

function sortCandidates(arr) {
  return [...arr].sort((a, b) =>
    (a.qualityRank ?? qualityRank(a.quality)) - (b.qualityRank ?? qualityRank(b.quality)) ||
    Number(a.ping > 0 ? a.ping : Infinity) - Number(b.ping > 0 ? b.ping : Infinity) ||
    Number(b.share || 0) - Number(a.share || 0) ||
    Number(b.speedMbps || 0) - Number(a.speedMbps || 0)
  );
}

function getSavedServer() {
  const s = loadSettings();
  const last = s.last;
  if (!last || !last.host || !HOST_RE.test(last.host)) return null;
  const port = Math.min(65535, Math.max(1, Number(last.port) || 443));
  return {
    ...last,
    port,
    user: last.user || 'vpn',
    pass: last.pass || 'vpn',
    psk: last.psk || 'vpn',
    protocol: normProtocol(last.protocol || s.protocol)
  };
}

async function connectVpn(opts = {}) {
  const s = loadSettings();
  const protocol = normProtocol(opts.protocol || s.protocol);
  const host = String(opts.host || '').trim();
  const port = Math.min(65535, Math.max(1, Number(opts.port) || 443));
  const user = String(opts.user ?? 'vpn');
  const pass = String(opts.pass ?? 'vpn');
  const psk = String(opts.psk ?? 'vpn');

  if (!host || !HOST_RE.test(host)) {
    return { ok: false, error: 'Invalid host', errorCode: 'BAD_HOST' };
  }

  const myGen = ++connectGeneration;
  intentionalDisconnect = true;
  connectingNow = true;
  manualDisconnect = false;
  stopWaitingNetwork();

  logMain(`connecting [${protocol.toUpperCase()}] -> ${host}${protocol === 'sstp' ? ':' + port : ''}`);

  try {
    const res = await configureAndDial({
      protocol,
      host,
      port,
      user,
      pass,
      psk,
      settings: s,
      routeStateFile: ROUTE_STATE_FILE,
      isCancelled: () => manualDisconnect || isQuitting || myGen !== connectGeneration
    });

    if (!res.ok) {
      if (res.errorCode !== 'CANCELLED') {
        logMain(`connect failed [${protocol.toUpperCase()}]: ${res.error || 'unknown'}`);
      }
      return res;
    }

    lastKnownConnected = true;
    const bypassNote = res.routesApplied ? ` (direct routes: ${res.routesApplied})` : '';
    logMain(`connected [${protocol.toUpperCase()}]: ${host}${bypassNote}`);
    emitEvent('connected', { host, port, protocol, routesApplied: res.routesApplied || 0 });
    return { ok: true, host, port, protocol, routesApplied: res.routesApplied || 0 };
  } finally {
    connectingNow = false;
    intentionalDisconnect = false;
    refreshTrayMenu().catch(logErr);
  }
}

async function connectSaved(serverOverride = null) {
  const s = loadSettings();
  const srv = serverOverride || getSavedServer();
  if (!srv) return { ok: false, error: 'no saved server', errorCode: 'NO_SERVER' };
  return connectVpn({ ...srv, protocol: normProtocol(srv.protocol || s.protocol) });
}

async function findFailoverServer(protocol, excluded) {
  const proto = normProtocol(protocol);
  let poolList = serverCache[proto];
  if (!Array.isArray(poolList) || !poolList.length) {
    try {
      poolList = await fetchServersForProtocol(proto);
      serverCache[proto] = poolList;
    } catch {
      poolList = [];
    }
  }

  const candidates = sortCandidates(
    poolList.filter((x) => x && HOST_RE.test(x.host) && !excluded.has(x.host))
  );
  if (!candidates.length) return null;

  const hMap = healthCache[proto];
  const cached = candidates
    .map((srv) => ({ srv, h: hMap.get(srv.host) }))
    .filter((x) => x.h && x.h.ok && Date.now() - x.h.at < 10 * 60 * 1000)
    .sort((a, b) =>
      (a.srv.qualityRank ?? 2) - (b.srv.qualityRank ?? 2) ||
      Number(a.h.ms) - Number(b.h.ms)
    );
  if (cached.length) return cached[0].srv;

  const sample = candidates.slice(0, 10);
  const tested = await Promise.all(
    sample.map(async (srv) => ({ srv, ms: await probeServer(proto, srv) }))
  );
  return tested
    .filter((x) => x.ms > 0)
    .sort((a, b) =>
      (a.srv.qualityRank ?? 2) - (b.srv.qualityRank ?? 2) ||
      a.ms - b.ms
    )[0]?.srv || null;
}

function stopWaitingNetwork() {
  waitingNetwork = false;
  if (waitingNetTimer) {
    clearInterval(waitingNetTimer);
    waitingNetTimer = null;
  }
}

function startWaitingForInternet(reason = 'no internet') {
  if (manualDisconnect || isQuitting || waitingNetTimer) return;
  waitingNetwork = true;
  emitEvent('waitingNetwork', {});
  logMain('waiting for internet connectivity...');

  waitingNetTimer = setInterval(async () => {
    if (manualDisconnect || isQuitting) {
      stopWaitingNetwork();
      return;
    }
    const online = await checkInternet();
    if (online) {
      stopWaitingNetwork();
      logMain('internet restored; reconnecting now');
      runReconnect(reason).catch(logErr);
    }
  }, 3500);
}

function cancelReconnect() {
  reconnectGeneration++;
  connectGeneration++;
  stopWaitingNetwork();
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect(reason = '') {
  const s = loadSettings();
  if (manualDisconnect || s.autoReconnect === false || !getSavedServer() || reconnectTimer || reconnecting || waitingNetTimer || isQuitting) {
    return;
  }
  const delay = Math.max(5, Number(s.reconnectDelay || 10)) * 1000;
  reconnectTimer = setTimeout(() => runReconnect(reason).catch(logErr), delay);
}

async function runReconnect(reason = '') {
  if (manualDisconnect || isQuitting || reconnecting) return;
  const s = loadSettings();
  const saved = getSavedServer();
  if (!saved) return;

  const online = await checkInternet();
  if (!online) {
    startWaitingForInternet(reason || 'network offline');
    return;
  }

  reconnecting = true;
  reconnectTimer = null;
  const generation = ++reconnectGeneration;
  const protocol = normProtocol(s.protocol);
  const attempts = Math.max(1, Math.min(10, Number(s.reconnectAttempts || 3)));
  const delay = Math.max(5, Number(s.reconnectDelay || 10));

  const tried = new Set();
  let current = { ...saved, protocol };
  let switched = false;

  try {
    for (;;) {
      if (manualDisconnect || isQuitting || generation !== reconnectGeneration) return;
      tried.add(current.host);

      for (let attempt = 1; attempt <= attempts; attempt++) {
        if (manualDisconnect || isQuitting || generation !== reconnectGeneration) return;

        if (!(await checkInternet())) {
          startWaitingForInternet('internet dropped during reconnect');
          return;
        }

        emitEvent('reconnecting', { attempt, attempts, host: current.host, switched, protocol });
        logMain(`reconnect ${attempt}/${attempts} [${protocol.toUpperCase()}]: ${current.host}${reason ? ' (' + reason + ')' : ''}`);

        const r = await connectSaved(current);
        if (r.ok) {
          patchSettings({
            last: {
              ...current,
              listKey: current.listKey || protocol
            }
          });
          emitEvent('reconnected', { host: current.host, switched, protocol });
          logMain('reconnected: ' + current.host);
          return;
        }

        if (manualDisconnect || isQuitting || generation !== reconnectGeneration) return;
        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        }
      }

      if (loadSettings().autoFailover === false) {
        emitEvent('reconnectFailed', {});
        logMain('reconnect exhausted (failover disabled)');
        return;
      }

      emitEvent('switchingServer', { protocol });
      const next = await findFailoverServer(protocol, tried);
      if (!next) {
        emitEvent('reconnectFailed', {});
        logMain('no healthy failover server found');
        return;
      }

      current = {
        ...next,
        user: next.user || 'vpn',
        pass: next.pass || 'vpn',
        psk: next.psk || 'vpn',
        protocol,
        listKey: protocol
      };
      switched = true;
      reason = 'server failover';
    }
  } finally {
    reconnecting = false;
    refreshTrayMenu().catch(() => {});
  }
}

function localizedTray() {
  const s = loadSettings();
  const fa = s.lang !== 'en';
  const protoLabel = (s.protocol === 'sstp' ? 'SSTP' : 'L2TP/IPsec');
  return fa ? {
    connect: 'اتصال',
    disconnect: 'قطع اتصال',
    open: 'باز کردن بنفش',
    quit: 'خروج',
    connected: `وصل است · ${protoLabel}`,
    offline: `قطع است · ${protoLabel}`,
    connecting: 'در حال اتصال…',
    waiting: 'در انتظار اینترنت…',
    service: 'سرویس اتصال',
    checkUpdate: 'بررسی به‌روزرسانی'
  } : {
    connect: 'Connect',
    disconnect: 'Disconnect',
    open: 'Open Banafsh',
    quit: 'Quit',
    connected: `Connected · ${protoLabel}`,
    offline: `Disconnected · ${protoLabel}`,
    connecting: 'Connecting…',
    waiting: 'Waiting for internet…',
    service: 'Connection service',
    checkUpdate: 'Check for updates'
  };
}

async function refreshTrayMenu() {
  if (!tray) return;
  const s = loadSettings();
  const l = localizedTray();
  const c = !!lastKnownConnected;
  const busy = reconnecting || connectingNow;
  const stateLabel = waitingNetwork ? l.waiting : (busy ? l.connecting : (c ? l.connected : l.offline));

  tray.setToolTip(`Banafsh — ${stateLabel}`);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: stateLabel, enabled: false },
    { type: 'separator' },
    {
      label: busy || waitingNetwork ? l.connecting : (c ? l.disconnect : l.connect),
      enabled: !connectingNow,
      click: async () => {
        if (connectingNow || intentionalDisconnect) return;
        if (reconnecting || waitingNetwork) {
          manualDisconnect = true;
          cancelReconnect();
          await disconnectAll(ROUTE_STATE_FILE);
          lastKnownConnected = false;
          emitEvent('status', { connected: false });
        } else if (await isConnected()) {
          manualDisconnect = true;
          cancelReconnect();
          await disconnectAll(ROUTE_STATE_FILE);
          lastKnownConnected = false;
          emitEvent('status', { connected: false });
        } else {
          showWindow();
          if (getSavedServer()) {
            manualDisconnect = false;
            const r = await connectSaved();
            if (!r.ok && r.errorCode !== 'CANCELLED') {
              emitEvent('connectionError', { error: r.error, errorCode: r.errorCode });
            }
          } else {
            emitEvent('pickServerNeeded', {});
          }
        }
        refreshTrayMenu().catch(logErr);
      }
    },
    {
      label: l.service,
      submenu: [
        {
          label: 'L2TP/IPsec',
          type: 'radio',
          checked: s.protocol !== 'sstp',
          click: () => patchSettings({ protocol: 'l2tp' })
        },
        {
          label: 'SSTP',
          type: 'radio',
          checked: s.protocol === 'sstp',
          click: () => patchSettings({ protocol: 'sstp' })
        }
      ]
    },
    { label: l.checkUpdate, click: () => { showWindow(); emitEvent('triggerUpdateCheck', {}); } },
    { label: l.open, click: () => showWindow() },
    { type: 'separator' },
    { label: l.quit, click: () => performQuit().catch(logErr) }
  ]));
}

function showDesktopNotification(title, body) {
  try {
    if (!Notification || !Notification.isSupported()) return;
    const iconPath = path.join(__dirname, 'build', 'icon.png');
    const n = new Notification({ title, body, icon: iconPath });
    n.on('click', () => showWindow());
    n.show();
  } catch {}
}

async function runBackgroundChecks() {
  try {
    const s = loadSettings();
    const lang = s.lang === 'en' ? 'en' : 'fa';

    // 1. News check
    const newsRes = await fetchNews(lang);
    if (newsRes.ok && newsRes.raw) {
      saveSettings({ newsCache: newsRes.raw });
      if (newsRes.item && s.newsDismissedId !== newsRes.item.id) {
        emitEvent('newsAvailable', { item: newsRes.item });
        if (s.newsNotifiedId !== newsRes.item.id) {
          showDesktopNotification(newsRes.item.title || 'Banafsh', newsRes.item.text || '');
          saveSettings({ newsNotifiedId: newsRes.item.id });
        }
      }
    }

    // 2. Daily update check
    const DAY = 24 * 60 * 60 * 1000;
    if (Date.now() - Number(s.updateLastCheck || 0) >= DAY) {
      const rel = await fetchLatestRelease({ isPortable: IS_PORTABLE });
      if (rel.ok) {
        const newer = rel.info && isNewer(rel.info.version, APP_VERSION) ? rel.info : null;
        saveSettings({ updateLastCheck: Date.now(), updateFound: newer });
        if (newer && s.updateDismissedVersion !== newer.version) {
          emitEvent('updateAvailable', {
            info: { ...newer, localizedNotes: pickNotes(newer.notes, lang) }
          });
          if (s.updateNotifiedVersion !== newer.version) {
            showDesktopNotification(
              lang === 'fa' ? 'نسخه‌ی جدید بنفش آماده است' : 'New Banafsh update available',
              lang === 'fa' ? `بنفش ${newer.version} آماده‌ی نصب است` : `Banafsh ${newer.version} is ready to install`
            );
            saveSettings({ updateNotifiedVersion: newer.version });
          }
        }
      }
    }
  } catch (e) {
    logErr(e);
  }
}

function resolveEffectiveDark(themeSetting) {
  if (themeSetting === 'light') return false;
  if (themeSetting === 'system') return nativeTheme.shouldUseDarkColors;
  return true;
}

function showWindow() {
  if (!win || win.isDestroyed()) createWindow();
  if (!win || win.isDestroyed()) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function createTray() {
  if (tray) return;
  const iconPath = path.join(__dirname, 'build', 'icon.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (!icon.isEmpty()) icon = icon.resize({ width: 32, height: 32 });
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.on('click', showWindow);
  tray.on('double-click', showWindow);
  tray.on('right-click', () => refreshTrayMenu().catch(logErr));
  refreshTrayMenu().catch(logErr);
}

function createWindow() {
  const s = loadSettings();
  const isDark = resolveEffectiveDark(s.theme);
  win = new BrowserWindow({
    width: 430,
    height: 780,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    frame: false,
    backgroundColor: isDark ? '#120d1d' : '#f4eeff',
    title: 'Banafsh',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.on('close', (e) => {
    if (isQuitting) return;
    e.preventDefault();
    if (closePrompt) return;
    const cur = loadSettings();
    if (cur.closeBehavior === 'keep') { win.hide(); return; }
    if (cur.closeBehavior === 'quit') { performQuit().catch(logErr); return; }
    closePrompt = true;
    emitEvent('closeRequest', { connected: lastKnownConnected, lang: cur.lang });
  });
}

// ---- IPC Handlers ----

ipcMain.handle('window:close-choice', async (_, choice, remember) => {
  if (!win || win.isDestroyed()) return false;
  if (remember && (choice === 'keep' || choice === 'quit')) {
    patchSettings({ closeBehavior: choice });
  }
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

ipcMain.handle('window:minimize', () => {
  if (win && !win.isDestroyed()) win.minimize();
  return true;
});

ipcMain.handle('window:close', () => {
  if (win && !win.isDestroyed()) win.close();
  return true;
});

ipcMain.handle('window:theme', (_, isDark) => {
  if (win && !win.isDestroyed()) {
    try { win.setBackgroundColor(isDark ? '#120d1d' : '#f4eeff'); } catch {}
  }
  return true;
});

ipcMain.handle('app:info', () => ({
  version: APP_VERSION,
  isPortable: IS_PORTABLE,
  platform: process.platform,
  systemDark: nativeTheme.shouldUseDarkColors,
  releasesPage: RELEASES_PAGE
}));

ipcMain.handle('app:open-external', async (_, url) => {
  const str = String(url || '').trim();
  if (/^https?:\/\//i.test(str)) {
    await shell.openExternal(str);
    return true;
  }
  return false;
});

ipcMain.handle('servers:load', async (_, protocol) => {
  const proto = normProtocol(protocol || loadSettings().protocol);
  const list = await fetchServersForProtocol(proto);
  serverCache[proto] = list;
  return list;
});

ipcMain.handle('servers:test', async (_, opts = {}) => {
  const proto = normProtocol(opts.protocol || loadSettings().protocol);
  return probeServer(proto, opts);
});

ipcMain.handle('servers:health', (_, protocol, results) => {
  updateHealth(protocol, results);
  return true;
});

ipcMain.handle('servers:verify-for-protocol', async (_, protocol, host) => {
  const proto = normProtocol(protocol);
  const cleanHost = String(host || '').trim();
  if (!cleanHost) return true;
  if (serverCache[proto] && serverCache[proto].length > 0) {
    return serverCache[proto].some((s) => s.host === cleanHost);
  }
  const hosts = await fetchServerHosts(proto);
  if (!hosts) return false;
  return hosts.has(cleanHost);
});

ipcMain.handle('startup:get', () => startupState);
ipcMain.handle('settings:get', () => loadSettings());
ipcMain.handle('settings:set', (_, s) => {
  saveSettings(s);
  refreshTrayMenu().catch(logErr);
  return true;
});

ipcMain.handle('net:check', () => checkInternet());

ipcMain.handle('vpn:connect', async (_, opts) => connectVpn(opts));

ipcMain.handle('vpn:cancel', async () => {
  manualDisconnect = true;
  cancelReconnect();
  try { await disconnectAll(ROUTE_STATE_FILE); } catch (e) { logErr(e); }
  lastKnownConnected = false;
  emitEvent('status', { connected: false });
  return true;
});

ipcMain.handle('vpn:disconnect', async () => {
  manualDisconnect = true;
  cancelReconnect();
  statsSampler.stop();
  await disconnectAll(ROUTE_STATE_FILE);
  lastKnownConnected = false;
  emitEvent('status', { connected: false });
  return true;
});

ipcMain.handle('vpn:status', async () => {
  const c = await isConnected();
  if (lastKnownConnected && !c && !manualDisconnect) {
    clearBypassRoutes(ROUTE_STATE_FILE).catch(() => {});
    scheduleReconnect('connection lost');
  }
  lastKnownConnected = c;
  if (c) statsSampler.start();
  else statsSampler.stop();
  return c;
});

ipcMain.handle('bypass:sync', async () => {
  const s = loadSettings();
  const res = await syncBypassRoutesLive({
    settings: s,
    routeStateFile: ROUTE_STATE_FILE,
    currentServerHost: s.last?.host || ''
  });
  if (res.active) {
    logMain(`synced direct routes: ${res.routesApplied}`);
  }
  return res;
});

// QR Share & Receive
ipcMain.handle('qr:encode', (_, server) => {
  const payload = encodeServer(server);
  const svg = makeQrSvg(payload);
  return { payload, svg };
});

ipcMain.handle('qr:decode', (_, text) => decodeServer(text));

ipcMain.handle('qr:save-svg', async (_, svg, host) => {
  if (!win || win.isDestroyed() || !svg) return false;
  const safeHost = String(host || 'banafsh-server').replace(/[^A-Za-z0-9._-]/g, '_');
  const res = await dialog.showSaveDialog(win, {
    defaultPath: `Banafsh-QR-${safeHost}.svg`,
    filters: [{ name: 'SVG Image', extensions: ['svg'] }]
  });
  if (res.canceled || !res.filePath) return false;
  fs.writeFileSync(res.filePath, String(svg), 'utf8');
  return true;
});

// Profile Import / Export
ipcMain.handle('profile:export', async (_, server) => {
  if (!win || win.isDestroyed()) return false;
  const s = loadSettings();
  const target = server || s.last;
  if (!target || !target.host) return false;
  const safeHost = String(target.host).replace(/[^A-Za-z0-9._-]/g, '_');
  const res = await dialog.showSaveDialog(win, {
    defaultPath: `${safeHost}.json`,
    filters: [{ name: 'Banafsh Profile', extensions: ['json'] }]
  });
  if (res.canceled || !res.filePath) return false;
  fs.writeFileSync(res.filePath, serializeProfileJson(target, s), 'utf8');
  return true;
});

ipcMain.handle('profile:import', async () => {
  if (!win || win.isDestroyed()) return { canceled: true };
  const res = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Banafsh Profile (JSON)', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }]
  });
  if (res.canceled || !res.filePaths || !res.filePaths[0]) return { canceled: true };
  try {
    const raw = fs.readFileSync(res.filePaths[0], 'utf8');
    const profile = parseProfileJson(raw);
    if (!profile) return { canceled: false, ok: false };
    return { canceled: false, ok: true, profile };
  } catch {
    return { canceled: false, ok: false };
  }
});

// Updates & News
ipcMain.handle('update:check', async (_, manual = false) => {
  const s = loadSettings();
  const lang = s.lang === 'en' ? 'en' : 'fa';
  const rel = await fetchLatestRelease({ isPortable: IS_PORTABLE });
  if (!rel.ok) return { ok: false };

  const newer = rel.info && isNewer(rel.info.version, APP_VERSION) ? rel.info : null;
  saveSettings({ updateLastCheck: Date.now(), updateFound: newer });

  if (!newer) {
    return { ok: true, upToDate: true };
  }

  return {
    ok: true,
    upToDate: false,
    dismissed: !manual && s.updateDismissedVersion === newer.version,
    info: {
      ...newer,
      localizedNotes: pickNotes(newer.notes, lang)
    }
  };
});

ipcMain.handle('update:download', async (_, info) => {
  if (!info || !info.exeUrl) return { ok: false };
  updateDownloadCancelled = false;
  const destDir = path.join(app.getPath('temp'), 'Banafsh-Updates');
  const filePath = await downloadReleaseAsset(
    info,
    destDir,
    (done, total) => {
      const percent = total > 0 ? Math.min(100, Math.round((done * 100) / total)) : 0;
      emitEvent('updateProgress', { percent, done, total });
    },
    () => updateDownloadCancelled || isQuitting
  );

  if (updateDownloadCancelled) return { ok: false, cancelled: true };
  if (!filePath) return { ok: false };
  return { ok: true, filePath, isPortable: /portable\.exe$/i.test(filePath) };
});

ipcMain.handle('update:cancel-download', () => {
  updateDownloadCancelled = true;
  return true;
});

ipcMain.handle('update:install', async (_, filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) return false;
    if (/portable\.exe$/i.test(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    }
    const child = spawn(filePath, [], { detached: true, stdio: 'ignore' });
    child.unref();
    setTimeout(() => { performQuit().catch(logErr); }, 600);
    return true;
  } catch (e) {
    logErr(e);
    return false;
  }
});

ipcMain.handle('news:check', async () => {
  const s = loadSettings();
  const lang = s.lang === 'en' ? 'en' : 'fa';
  const res = await fetchNews(lang);
  if (res.ok && res.raw) {
    saveSettings({ newsCache: res.raw });
    return {
      ok: true,
      item: res.item && s.newsDismissedId !== res.item.id ? res.item : null
    };
  }
  const cached = parseNews(s.newsCache, lang);
  return {
    ok: false,
    item: cached && s.newsDismissedId !== cached.id ? cached : null
  };
});

// Logs
ipcMain.handle('log:get', () => {
  try {
    if (!fs.existsSync(LOGF)) return '';
    const txt = fs.readFileSync(LOGF, 'utf8');
    const lines = txt.trim().split(/\r?\n/);
    return lines.slice(-250).join('\n');
  } catch {
    return '';
  }
});

ipcMain.handle('log:clear', () => {
  try {
    if (fs.existsSync(LOGF)) fs.writeFileSync(LOGF, '', 'utf8');
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('log:reveal', () => {
  try {
    if (fs.existsSync(LOGF)) shell.showItemInFolder(LOGF);
    else shell.openPath(dataDir);
    return true;
  } catch {
    return false;
  }
});

// ---- Lifecycle & Monitors ----

process.on('uncaughtException', (e) => {
  logErr(e);
  try { dialog.showErrorBox('Banafsh', String((e && e.message) || e)); } catch {}
});
process.on('unhandledRejection', logErr);

function relaunchAsAdmin() {
  const exe = process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;
  const extra = app.isPackaged ? '' : ' -ArgumentList ' + psQuote(app.getAppPath());
  return ps(`Start-Process -FilePath ${psQuote(exe)}${extra} -Verb RunAs`);
}

async function performQuit() {
  if (isQuitting) return;
  isQuitting = true;
  manualDisconnect = true;
  cancelReconnect();
  statsSampler.stop();
  clearInterval(monitorTimer);
  clearInterval(backgroundNewsTimer);
  await disconnectAll(ROUTE_STATE_FILE);
  app.quit();
}

function startMonitor() {
  clearInterval(monitorTimer);
  monitorTimer = setInterval(async () => {
    if (isQuitting || intentionalDisconnect || connectingNow || !lastKnownConnected) return;
    try {
      const c = await isConnected();
      if (lastKnownConnected && !c && !manualDisconnect) {
        clearBypassRoutes(ROUTE_STATE_FILE).catch(() => {});
        emitEvent('connectionLost', {});
        const online = await checkInternet();
        if (!online) {
          startWaitingForInternet('connection lost & internet offline');
        } else {
          scheduleReconnect('connection lost');
        }
      }
      if (c && reconnecting) emitEvent('status', { connected: true });
      lastKnownConnected = c;
      refreshTrayMenu().catch(() => {});
    } catch (e) {
      logErr(e);
    }
  }, 6000);
}

nativeTheme.on('updated', () => {
  const s = loadSettings();
  if (s.theme === 'system') {
    const isDark = nativeTheme.shouldUseDarkColors;
    if (win && !win.isDestroyed()) {
      try { win.setBackgroundColor(isDark ? '#120d1d' : '#f4eeff'); } catch {}
    }
    emitEvent('systemTheme', { systemDark: isDark });
  }
});

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => showWindow());

  app.whenReady().then(async () => {
    try {
      createWindow();
      createTray();
      startupProgress(10, 'در حال آماده‌سازی رابط برنامه...');

      const startupStartedAt = Date.now();
      const hold = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await hold(120);
      startupProgress(24, 'در حال بررسی دسترسی‌های ویندوز...');
      const admin = await isAdmin();
      if (!admin) {
        startupProgress(55, 'درخواست دسترسی Administrator...');
        app.releaseSingleInstanceLock();
        const r = await relaunchAsAdmin();
        if (r.code) {
          dialog.showErrorBox(
            'Banafsh',
            'برای کار کردن برنامه اجازه‌ی Administrator لازمه.\nThis app needs Administrator permission.'
          );
        }
        if (tray) { try { tray.destroy(); } catch {} }
        app.exit(0);
        return;
      }

      startupProgress(50, 'در حال آماده‌سازی سرویس‌های اتصال...');
      await hold(120);
      startMonitor();
      startupProgress(68, 'در حال خواندن تنظیمات...');
      const s = loadSettings();
      await hold(100);
      startupProgress(84, 'در حال بررسی وضعیت اتصال...');
      const c = await isConnected();
      lastKnownConnected = c;
      if (c) statsSampler.start();
      else await disconnectAll(ROUTE_STATE_FILE, { removeEntries: true });
      startupProgress(95, 'تقریباً آماده است...');
      refreshTrayMenu().catch(() => {});

      if (s.reconnectOnStart && s.last && !c) {
        setTimeout(() => connectSaved().catch(logErr), 1400);
      }

      // Check news & updates shortly after startup, and periodically in background
      setTimeout(() => runBackgroundChecks().catch(logErr), 2800);
      backgroundNewsTimer = setInterval(() => runBackgroundChecks().catch(logErr), 30 * 60 * 1000);

      const elapsed = Date.now() - startupStartedAt;
      if (elapsed < 1000) await hold(1000 - elapsed);
      startupProgress(100, 'آماده شد');
    } catch (e) {
      logErr(e);
      dialog.showErrorBox('Banafsh', String((e && e.message) || e));
      app.quit();
    }
  });

  app.on('window-all-closed', (e) => {
    if (!isQuitting) return;
    e.preventDefault();
  });

  app.on('before-quit', async (e) => {
    if (isQuitting) return;
    e.preventDefault();
    await performQuit();
  });
}
