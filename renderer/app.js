const T = {
  en: {
    home:'Home', servers:'Servers', bypass:'No VPN', settings:'Settings', off:'Not connected', busy:'Connecting...', on:'Connected',
    reconnecting:'Reconnecting...', switching:'Trying another server...',
    connect:'Connect', disconnect:'Disconnect', connecting:'Please wait...', disconnecting:'Disconnecting...', reconnectingButton:'Reconnecting...', change:'Change', free:'Pick a free server', none:'No server selected',
    stitle:'Free servers', snote:'Auto-tested when you open this list; broken ones go last', ok:'Online', bad:'Failed', wait:'Testing', testall:'Test all',
    btitle:'Sites without VPN', bnote:'These sites open directly, without VPN, while connected', add:'Add', ph:'e.g. site.ir',
    sub:'Common subdomains (www, pay, api...) are added automatically', lang:'Language', about:'About', log:'Log', advanced:'Advanced',
    reconnectTitle:'Connection', autoReconnect:'Auto reconnect', autoReconnectNote:'Reconnect automatically if the VPN connection drops',
    startupReconnect:'Reconnect on startup', startupReconnectNote:'Restore the last connection when Banafsh starts',
    reconnectAttempts:'Reconnect attempts', reconnectAttemptsNote:'Attempts on the same server before trying another healthy server',
    reconnectDelay:'Reconnect delay', seconds:'seconds', tries:'tries',
    closeTitle:'When closing the window', closeAsk:'Ask me', closeKeep:'Keep connection and minimize to tray', closeQuit:'Disconnect and quit',
    trayNote:'Banafsh can stay active next to the clock even when the window is closed.',
    inv:'Invalid address', nook:'No working server found', fail:'Connection failed', rec:'Reconnect to apply the change', ldfail:'Could not load the server list',
    refreshing:'Testing servers...', saved:'Saved', reconnectAttempt:'Attempt', of:'of', connectedTo:'Connected to',
    connectionLost:'Connection lost. Reconnecting...', failover:'Current server is not responding. Trying another healthy server...',
    reconnectFailed:'Automatic reconnect failed.', closeModalTitle:'Close Banafsh', closeModalDetail:'Banafsh will remain next to the clock. You can reopen the window or manage the connection from there.', dontAsk:'Don\'t ask me again', keepClose:'Close window only', quitClose:'Disconnect and quit', cancelClose:'Cancel', closeConnected:'The VPN connection is active. You can keep it running and close only the window, or quit completely.', closeOffline:'You can keep Banafsh running in the system tray or quit the application completely.', version:'Banafsh 0.1.10'
  },
  fa: {
    home:'خانه', servers:'سرورها', bypass:'بدون VPN', settings:'تنظیمات', off:'وصل نیستی', busy:'در حال اتصال...', on:'وصل هستی',
    reconnecting:'در حال اتصال مجدد...', switching:'در حال امتحان کردن سرور دیگر...',
    connect:'اتصال', disconnect:'قطع اتصال', connecting:'لطفاً منتظر بمانید...', disconnecting:'در حال قطع اتصال...', reconnectingButton:'در حال اتصال مجدد...', change:'تغییر', free:'انتخاب سرور رایگان', none:'سروری انتخاب نشده',
    stitle:'سرورهای رایگان', snote:'با باز کردن این لیست خودکار تست می‌شوند؛ خراب‌ها آخر لیست می‌روند', ok:'سالم', bad:'خراب', wait:'در حال تست', testall:'تست همه',
    btitle:'سایت‌های بدون VPN', bnote:'این سایت‌ها موقع اتصال مستقیم و بدون VPN باز می‌شن', add:'افزودن', ph:'مثلا site.ir',
    sub:'زیردامنه‌های رایج (www، pay، api، ...) خودکار اضافه می‌شن', lang:'زبان', about:'درباره', log:'گزارش (Log)', advanced:'پیشرفته',
    reconnectTitle:'اتصال', autoReconnect:'اتصال مجدد خودکار', autoReconnectNote:'اگر اتصال VPN قطع شد، Banafsh خودکار دوباره وصل شود',
    startupReconnect:'اتصال مجدد هنگام شروع', startupReconnectNote:'با اجرای Banafsh آخرین اتصال را برگردان',
    reconnectAttempts:'تعداد تلاش اتصال مجدد', reconnectAttemptsNote:'تلاش روی همان سرور قبل از رفتن سراغ یک سرور سالم دیگر',
    reconnectDelay:'فاصله اتصال مجدد', seconds:'ثانیه', tries:'تلاش',
    closeTitle:'رفتار هنگام بستن پنجره', closeAsk:'از من بپرس', closeKeep:'اتصال بماند و برنامه کنار ساعت برود', closeQuit:'قطع اتصال و خروج',
    trayNote:'حتی وقتی پنجره بسته است، Banafsh می‌تواند کنار ساعت فعال بماند.',
    inv:'آدرس درست نیست', nook:'سرور سالمی پیدا نشد', fail:'اتصال انجام نشد', rec:'برای اعمال تغییر یک‌بار قطع و وصل کن', ldfail:'لیست سرورها گرفته نشد',
    refreshing:'در حال تست سرورها...', saved:'ذخیره شد', reconnectAttempt:'تلاش', of:'از', connectedTo:'متصل به',
    connectionLost:'اتصال قطع شد؛ در حال اتصال مجدد...', failover:'سرور فعلی پاسخ نمی‌دهد؛ در حال امتحان کردن یک سرور سالم دیگر...',
    reconnectFailed:'اتصال مجدد خودکار ناموفق بود.', closeModalTitle:'بستن Banafsh', closeModalDetail:'Banafsh در کنار ساعت می‌ماند و از همان‌جا می‌توانی دوباره پنجره را باز کنی یا اتصال را مدیریت کنی.', dontAsk:'دیگر این سؤال را نپرس', keepClose:'فقط پنجره بسته شود', quitClose:'قطع اتصال و خروج', cancelClose:'انصراف', closeConnected:'اتصال VPN برقرار است. می‌توانی اتصال را نگه داری و فقط پنجره را ببندی، یا کاملاً خارج شوی.', closeOffline:'می‌توانی Banafsh را کنار ساعت نگه داری یا برنامه را کاملاً ببندی.', version:'Banafsh 0.1.10'
  }
};
const DEFAULT_SITES = ['aparat.com', 'digikala.com', 'divar.ir', 'snapp.ir', 'bmi.ir'];
let S = { lang: 'fa', sites: null, last: null, autoReconnect: true, reconnectOnStart: false, reconnectDelay: 10, reconnectAttempts: 3, closeBehavior: 'ask' };
let servers = [], connected = false, busy = false, busyMode = 'connecting', testing = false, serversLoaded = false, serversTested = false;
const logs = [];
const $ = (id) => document.getElementById(id);
const t = (k) => T[S.lang][k] || k;
const el = (tag, o = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(o)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  e.append(...kids); return e;
};
const log = (m) => { logs.push(new Date().toLocaleTimeString() + ' ' + m); if (logs.length > 200) logs.shift(); $('log').textContent = logs.join('\n'); };
const toast = (m) => { const x = $('toast'); x.textContent = m; x.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => (x.hidden = true), 3500); };
const save = () => window.api.set(S);

function normSite(v) {
  v = v.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^\*\./, '').replace(/^www\./, '').split(/[\/?#:]/)[0];
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v) ? v : null;
}
function fmtSpeed(v) {
  if (!Number.isFinite(Number(v)) || Number(v) <= 0) return '--';
  const n = Number(v);
  return `${n >= 100 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, '')} Mbps`;
}
function sortServers(arr) {
  const order = { ok: 0, wait: 1, bad: 2 };
  const pingOf = (s) => Number(s.ping) > 0 ? Number(s.ping) : Number(s.ms) > 0 ? Number(s.ms) : Infinity;
  return [...arr].sort((a, b) =>
    order[a.state] - order[b.state] ||
    pingOf(a) - pingOf(b) ||
    Number(b.speedMbps || 0) - Number(a.speedMbps || 0)
  );
}
function setBusy(v, mode = 'connecting') { busy = v; busyMode = mode; renderHome(); renderServers(); }

function renderHome() {
  $('status').textContent = busy ? t('busy') : connected ? t('on') : t('off');
  $('big').textContent = busy ? t(busyMode) : connected ? t('disconnect') : t('connect');
  $('big').classList.toggle('on', connected);
  $('orb').classList.toggle('busy', busy);
  $('orb').classList.toggle('live', connected && !busy);
  $('cc').textContent = (S.last && S.last.cc) || '--';
  $('addr').textContent = S.last ? S.last.host : t('none');
}
function renderServers() {
  const arr = sortServers(servers);
  $('list').replaceChildren(...arr.map((s) => el('div', { class: 'item ' + s.state },
    el('span', { class: 'dot ' + s.state }),
    el('div', { class: 'info' },
      el('div', {}, el('span', { class: 'badge' }, s.cc || '--'), ' ', el('span', { class: 'host' }, s.host + ((Number(s.port) || 443) !== 443 ? ':' + s.port : ''))),
      el('div', { class: 'stats' },
        el('span', { class: 'stat-label ping' }, s.state === 'ok' ? `Ping: ${s.ms} ms` : 'Ping: --'),
        s.speedMbps > 0 ? el('span', { class: 'stat-label speed' }, `Speed: ${fmtSpeed(s.speedMbps)}`) : el('span', { class: 'stat-label speed muted' }, 'Speed: --')
      )),
    s.state === 'ok' ? el('button', { class: 'btn small-btn', onclick: () => { show('home'); go(s); } }, t('connect')) : '')));
  $('test-all').textContent = testing ? t('refreshing') : t('testall');
  $('test-all').disabled = testing || busy;
}
function renderSites() {
  $('sites').replaceChildren(...S.sites.map((s) => el('div', { class: 'item' },
    el('span', { class: 'site' }, s),
    el('button', { class: 'del', 'aria-label': 'x ' + s, onclick: () => { S.sites = S.sites.filter((x) => x !== s); save(); renderSites(); if (connected) toast(t('rec')); } }, '×'))));
}
function renderSettings() {
  $('auto-reconnect').checked = S.autoReconnect !== false;
  $('startup-reconnect').checked = !!S.reconnectOnStart;
  $('reconnect-delay').value = String(S.reconnectDelay || 10);
  $('reconnect-attempts').value = String(S.reconnectAttempts || 3);
  document.querySelectorAll('input[name="close-behavior"]').forEach((r) => { r.checked = r.value === (S.closeBehavior || 'ask'); });
}
function applyLang() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-t]').forEach((e) => (e.textContent = t(e.dataset.t)));
  $('site-in').placeholder = t('ph');
  renderHome(); renderServers(); renderSites(); renderSettings();
}
async function show(name) {
  document.querySelectorAll('.screen').forEach((e) => (e.hidden = e.id !== 's-' + name));
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  if (name === 'servers' && !serversLoaded) await loadServers();
  if (name === 'servers' && serversLoaded && !serversTested && !testing) await testAll();
}

async function loadServers() {
  try { servers = (await window.api.servers()).map((s) => ({ ...s, state: 'wait', ms: 0 })); serversLoaded = true; serversTested = false; }
  catch (e) { servers = []; toast(t('ldfail')); log(String(e)); renderServers(); return; }
  renderServers();
}
async function testAll() {
  if (testing || !servers.length) return;
  testing = true; serversTested = false;
  servers.forEach((s) => { s.state = 'wait'; s.ms = 0; });
  renderServers();
  let i = 0;
  const worker = async () => {
    while (i < servers.length) {
      const s = servers[i++];
      const ms = await window.api.test(s.host, s.port);
      s.ms = ms; s.state = ms > 0 ? 'ok' : 'bad'; renderServers();
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  testing = false; serversTested = true; renderServers();
  await window.api.health(servers.map((s) => ({ host: s.host, ms: s.ms })));
}
async function best() {
  if (!servers.length) await loadServers();
  if (servers.some((s) => s.state === 'wait') || !serversTested) await testAll();
  return sortServers(servers.filter((s) => s.state === 'ok'))[0];
}
async function go(srv) {
  if (busy) return;
  setBusy(true, 'connecting');
  try {
    if (!srv) { srv = await best(); if (!srv) { toast(t('nook')); return; } }
    S.last = { ...srv }; save(); log('connect ' + srv.host + ':' + (srv.port || 443));
    const r = await window.api.connect({ host: srv.host, port: srv.port || 443, user: srv.user, pass: srv.pass, sites: S.sites });
    connected = !!r.ok;
    if (r.ok) log('connected; direct IPs: ' + r.bypassed); else { toast(t('fail')); log(r.error || 'unknown'); }
  } finally { setBusy(false); }
}

$('big').addEventListener('click', async () => {
  if (busy && busyMode === 'reconnectingButton') {
    await window.api.cancelReconnect();
    return;
  }
  if (busy) return;
  if (connected) {
    setBusy(true, 'disconnecting'); await window.api.disconnect(); connected = false; setBusy(false); log('disconnected');
  } else go(S.last);
});
$('free').addEventListener('click', async () => { if (busy) return; const s = await best(); if (s) go(s); else toast(t('nook')); });
$('change').addEventListener('click', () => show('servers'));
$('test-all').addEventListener('click', testAll);
$('add').addEventListener('click', () => {
  const v = normSite($('site-in').value);
  if (!v) return toast(t('inv'));
  if (!S.sites.includes(v)) { S.sites.push(v); save(); renderSites(); if (connected) toast(t('rec')); }
  $('site-in').value = '';
});
$('site-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('add').click(); });
$('l-en').addEventListener('click', () => { S.lang = 'en'; save(); applyLang(); });
$('l-fa').addEventListener('click', () => { S.lang = 'fa'; save(); applyLang(); });
$('auto-reconnect').addEventListener('change', (e) => { S.autoReconnect = e.target.checked; save(); toast(t('saved')); });
$('startup-reconnect').addEventListener('change', (e) => { S.reconnectOnStart = e.target.checked; save(); toast(t('saved')); });
$('reconnect-delay').addEventListener('change', (e) => { const n = Math.max(5, Math.min(300, Number(e.target.value) || 10)); S.reconnectDelay = n; e.target.value = String(n); save(); toast(t('saved')); });
$('reconnect-attempts').addEventListener('change', (e) => { const n = Math.max(1, Math.min(10, Number(e.target.value) || 3)); S.reconnectAttempts = n; e.target.value = String(n); save(); toast(t('saved')); });
document.querySelectorAll('input[name="close-behavior"]').forEach((r) => r.addEventListener('change', (e) => { S.closeBehavior = e.target.value; save(); toast(t('saved')); }));
$('win-min').addEventListener('click', () => window.api.minimize());
$('win-close').addEventListener('click', () => window.api.closeWindow());

document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));

const startup = $('startup');
const startupBar = $('startup-bar');
const startupPercent = $('startup-percent');
const startupText = $('startup-text');
const startupShownAt = Date.now();
let startupHideScheduled = false;
function applyStartup(ev) {
  if (!ev) return;
  const p = Math.max(0, Math.min(100, Number(ev.percent) || 0));
  startupBar.style.width = p + '%';
  startupPercent.textContent = p + '%';
  if (ev.text) startupText.textContent = ev.text;
  if (p >= 100 && !startupHideScheduled) {
    startupHideScheduled = true;
    const wait = Math.max(0, 1200 - (Date.now() - startupShownAt));
    setTimeout(() => {
      startup.classList.add('hidden');
      setTimeout(() => startup.remove(), 500);
    }, wait + 180);
  }
}
window.api.onStartup(applyStartup);
window.api.startupGet().then(applyStartup).catch(() => {});

const closeModal = $('close-modal');
const closeMessage = $('close-modal-message');
function openCloseModal(data) {
  const fa = S.lang === 'fa';
  closeMessage.textContent = data?.connected ? t('closeConnected') : t('closeOffline');
  $('close-keep').textContent = t('keepClose');
  $('close-quit').textContent = t('quitClose');
  $('close-cancel').textContent = t('cancelClose');
  closeModal.hidden = false;
  closeModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => $('close-keep').focus(), 0);
}
async function closeChoice(choice) {
  const remember = $('remember-close').checked;
  closeModal.hidden = true;
  closeModal.setAttribute('aria-hidden', 'true');
  $('remember-close').checked = false;
  await window.api.closeChoice(choice, remember);
}
$('close-keep').addEventListener('click', () => closeChoice('keep'));
$('close-quit').addEventListener('click', () => closeChoice('quit'));
$('close-cancel').addEventListener('click', () => closeChoice('cancel'));
$('close-modal-x').addEventListener('click', () => closeChoice('cancel'));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !closeModal.hidden) closeChoice('cancel'); });
window.api.onCloseRequest(openCloseModal);

window.api.onEvent((ev) => {
  if (!ev) return;
  if (ev.type === 'connected' || ev.type === 'reconnected') {
    connected = true; busy = false; renderHome();
    if (ev.type === 'reconnected') toast(t('connectedTo') + ' ' + ev.host);
    log('connected: ' + ev.host);
  } else if (ev.type === 'connectionLost') {
    connected = false; busy = true; busyMode = 'reconnectingButton'; renderHome(); toast(t('connectionLost')); log('connection lost');
  } else if (ev.type === 'reconnecting') {
    connected = false; busy = true; busyMode = 'reconnectingButton'; renderHome();
    $('status').textContent = `${t('reconnecting')} ${t('reconnectAttempt')} ${ev.attempt} ${t('of')} ${ev.attempts}`;
  } else if (ev.type === 'switchingServer') {
    connected = false; busy = true; busyMode = 'reconnectingButton'; renderHome(); $('status').textContent = t('switching'); toast(t('failover'));
  } else if (ev.type === 'reconnectFailed') {
    connected = false; busy = false; renderHome(); toast(t('reconnectFailed')); log('reconnect failed');
  } else if (ev.type === 'status') {
    connected = !!ev.connected; busy = false; renderHome();
  } else if (ev.type === 'connectionError') {
    connected = false; busy = false; renderHome(); toast(t('fail')); log(ev.error || 'connection error');
  }
});

(async () => {
  const saved = (await window.api.get()) || {};
  S = { ...S, ...saved };
  if (!Array.isArray(S.sites)) { S.sites = [...DEFAULT_SITES]; save(); }
  if (!S.reconnectAttempts) { S.reconnectAttempts = 3; save(); }
  if (!S.reconnectDelay) { S.reconnectDelay = 10; save(); }
  if (!S.closeBehavior) { S.closeBehavior = 'ask'; save(); }
  show('home'); applyLang();
  connected = await window.api.status(); renderHome();
})();
