const { app, BrowserWindow, ipcMain, shell } = require('electron');
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
let routes = [];

const dataDir = process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('userData');
const SF = path.join(dataDir, 'banafsh-settings.json');
const loadSettings = () => { try { return JSON.parse(fs.readFileSync(SF, 'utf8')); } catch { return {}; } };
const saveSettings = (s) => { try { fs.writeFileSync(SF, JSON.stringify(s, null, 1)); } catch {} };

const run = (file, args) => new Promise((res) =>
  execFile(file, args, { windowsHide: true, timeout: 60000 }, (e, out, err) =>
    res({ code: e ? (e.code || 1) : 0, out: String(out || ''), err: String(err || '') })));
const ps = (cmd) => run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', cmd]);

const getText = (u) => new Promise((res, rej) => {
  https.get(u, { timeout: 15000 }, (r) => {
    if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
    let d = ''; r.setEncoding('utf8');
    r.on('data', (c) => (d += c)); r.on('end', () => res(d));
  }).on('error', rej).on('timeout', function () { this.destroy(new Error('timeout')); });
});

function normServers(raw) {
  const arr = Array.isArray(raw) ? raw : (raw.servers || raw.items || []);
  const seen = new Set(); const out = [];
  for (const s of arr) {
    const host = s.host || s.hostname || s.address || s.ip;
    if (!host || !HOST_RE.test(host) || seen.has(host)) continue;
    seen.add(host);
    out.push({
      host,
      user: s.user || s.username || 'vpn',
      pass: s.pass || s.password || 'vpn',
      cc: String(s.cc || s.country_short || s.countryShort || s.country_code || s.countryCode || s.country || '').slice(0, 2).toUpperCase()
    });
  }
  return out;
}

// Windows SSTP always uses TCP 443, so we test 443.
const tcp = (host, port = 443, ms = 4000) => new Promise((res) => {
  const t0 = Date.now(); const s = net.connect({ host, port, timeout: ms });
  s.once('connect', () => { s.destroy(); res(Date.now() - t0); });
  s.once('error', () => res(-1));
  s.once('timeout', () => { s.destroy(); res(-1); });
});

async function getGateway() {
  const r = await ps(`Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Where-Object { $_.NextHop -ne '0.0.0.0' -and $_.InterfaceAlias -ne '${CONN}' } | Sort-Object RouteMetric | Select-Object -First 1 NextHop,InterfaceIndex | ConvertTo-Json`);
  try { const j = JSON.parse(r.out); return { hop: j.NextHop, idx: j.InterfaceIndex }; } catch { return null; }
}

async function resolveSites(sites) {
  const ips = new Set();
  const one = (name) => Promise.race([dns.resolve4(name), new Promise((_, rj) => setTimeout(() => rj(new Error('t')), 3000))]).then((a) => a.forEach((i) => ips.add(i))).catch(() => {});
  const jobs = [];
  for (const s of sites) { if (!HOST_RE.test(s)) continue; for (const sub of SUBS) jobs.push(one(sub ? sub + '.' + s : s)); }
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

ipcMain.handle('servers:load', async () => {
  let last;
  for (const u of SERVER_URLS) { try { return normServers(JSON.parse(await getText(u))); } catch (e) { last = e; } }
  throw last;
});
ipcMain.handle('servers:test', (_, host) => (HOST_RE.test(host) ? tcp(host) : -1));
ipcMain.handle('settings:get', () => loadSettings());
ipcMain.handle('settings:set', (_, s) => { saveSettings(s); return true; });
ipcMain.handle('open', (_, u) => { if (typeof u === 'string' && u.startsWith('https://t.me/')) shell.openExternal(u); });

ipcMain.handle('vpn:connect', async (_, { host, user, pass, sites }) => {
  if (!HOST_RE.test(host)) return { ok: false, error: 'bad host' };
  await disconnectAll();
  const gw = await getGateway();
  const ips = await resolveSites(Array.isArray(sites) ? sites : []);
  const common = `-Name '${CONN}' -ServerAddress '${host}' -TunnelType Sstp -EncryptionLevel Required`;
  let r = await ps(`if (Get-VpnConnection -Name '${CONN}' -ErrorAction SilentlyContinue) { Set-VpnConnection ${common} -Force } else { Add-VpnConnection ${common} -AuthenticationMethod MSChapv2 -Force }`);
  if (r.code) return { ok: false, error: (r.err || r.out).trim() };
  r = await run('rasdial', [CONN, String(user), String(pass)]);
  if (r.code) return { ok: false, error: (r.out + r.err).trim() };
  if (gw && gw.hop) {
    for (const ip of ips) {
      const x = await run('route', ['add', ip, 'mask', '255.255.255.255', gw.hop, 'if', String(gw.idx)]);
      if (!x.code) routes.push(ip);
    }
  }
  return { ok: true, bypassed: routes.length };
});
ipcMain.handle('vpn:disconnect', async () => { await disconnectAll(); return true; });
ipcMain.handle('vpn:status', async () => {
  const c = await isConnected();
  if (!c && routes.length) await clearRoutes();
  return c;
});

if (!app.requestSingleInstanceLock()) app.quit();
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 400, height: 720, useContentSize: true, resizable: false, maximizable: false,
    backgroundColor: '#17131f', title: 'Banafsh-sstp',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
});
app.on('window-all-closed', async () => { await disconnectAll(); app.quit(); });
