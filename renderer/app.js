const T = {
  en: { home:'Home', servers:'Servers', bypass:'No VPN', settings:'Settings', off:'Not connected', busy:'Connecting...', on:'Connected',
    connect:'Connect', disconnect:'Disconnect', change:'Change', free:'Pick a free server', none:'No server selected',
    stitle:'Free servers', snote:'Auto-tested; broken ones go last', ok:'Online', bad:'Failed', wait:'Testing',
    btitle:'Sites without VPN', bnote:'These sites open directly, without VPN, while connected', add:'Add', ph:'e.g. site.ir',
    sub:'Common subdomains (www, pay, api...) are added automatically', lang:'Language', about:'About', log:'Log',
    inv:'Invalid address', nook:'No working server found', fail:'Connection failed', rec:'Reconnect to apply the change', ldfail:'Could not load the server list' },
  fa: { home:'خانه', servers:'سرورها', bypass:'بدون VPN', settings:'تنظیمات', off:'وصل نیستی', busy:'در حال اتصال...', on:'وصل هستی',
    connect:'Connect', disconnect:'Disconnect', change:'تغییر', free:'انتخاب سرور رایگان', none:'سروری انتخاب نشده',
    stitle:'سرورهای رایگان', snote:'تست خودکار؛ خراب‌ها آخر لیست‌ان', ok:'آنلاین', bad:'خراب', wait:'در حال تست',
    btitle:'سایت‌های بدون VPN', bnote:'این سایت‌ها موقع اتصال مستقیم و بدون VPN باز می‌شن', add:'افزودن', ph:'مثلا site.ir',
    sub:'زیردامنه‌های رایج (www، pay، api، ...) خودکار اضافه می‌شن', lang:'زبان', about:'درباره', log:'گزارش (Log)',
    inv:'آدرس درست نیست', nook:'سرور سالمی پیدا نشد', fail:'اتصال انجام نشد', rec:'برای اعمال تغییر یک‌بار قطع و وصل کن', ldfail:'لیست سرورها گرفته نشد' }
};
const DEFAULT_SITES = ['aparat.com', 'digikala.com', 'divar.ir', 'snapp.ir', 'bmi.ir'];
let S = { lang: 'fa', sites: null, last: null };
let servers = [], connected = false, busy = false;
const logs = [];
const $ = (id) => document.getElementById(id);
const t = (k) => T[S.lang][k] || k;
const el = (tag, o = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(o)) {
    if (k === 'class') e.className = v;
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

function renderHome() {
  $('status').textContent = busy ? t('busy') : connected ? t('on') : t('off');
  $('big').textContent = connected ? t('disconnect') : t('connect');
  $('big').classList.toggle('on', connected);
  $('orb').classList.toggle('busy', busy);
  $('orb').classList.toggle('live', connected && !busy);
  $('cc').textContent = (S.last && S.last.cc) || '--';
  $('addr').textContent = S.last ? S.last.host : t('none');
}
function renderServers() {
  const order = { ok: 0, wait: 1, bad: 2 };
  const arr = [...servers].sort((a, b) => order[a.state] - order[b.state] || (a.ms - b.ms));
  $('list').replaceChildren(...arr.map((s) => el('div', { class: 'item ' + s.state },
    el('span', { class: 'dot ' + s.state }),
    el('div', { class: 'info' },
      el('div', {}, el('span', { class: 'badge' }, s.cc || '--'), ' ', el('span', { class: 'host' }, s.host)),
      el('div', { class: 'muted tiny' }, t(s.state) + (s.state === 'ok' ? ' · ' + s.ms + ' ms' : ''))),
    s.state === 'ok' ? el('button', { class: 'btn', onclick: () => { show('home'); go(s); } }, t('connect')) : '')));
}
function renderSites() {
  $('sites').replaceChildren(...S.sites.map((s) => el('div', { class: 'item' },
    el('span', { class: 'site' }, s),
    el('button', { class: 'del', 'aria-label': 'x ' + s, onclick: () => { S.sites = S.sites.filter((x) => x !== s); save(); renderSites(); if (connected) toast(t('rec')); } }, '×'))));
}
function applyLang() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-t]').forEach((e) => (e.textContent = t(e.dataset.t)));
  $('site-in').placeholder = t('ph');
  renderHome(); renderServers(); renderSites();
}
function show(name) {
  document.querySelectorAll('.screen').forEach((e) => (e.hidden = e.id !== 's-' + name));
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
}

async function loadServers() {
  try { servers = (await window.api.servers()).map((s) => ({ ...s, state: 'wait', ms: 0 })); }
  catch (e) { servers = []; toast(t('ldfail')); log(String(e)); renderServers(); return; }
  renderServers();
  let i = 0;
  const worker = async () => {
    while (i < servers.length) {
      const s = servers[i++]; const ms = await window.api.test(s.host);
      s.ms = ms; s.state = ms > 0 ? 'ok' : 'bad'; renderServers();
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
}
async function best() {
  if (!servers.length || servers.some((s) => s.state === 'wait')) await loadServers();
  return servers.filter((s) => s.state === 'ok').sort((a, b) => a.ms - b.ms)[0];
}
async function go(srv) {
  if (busy) return;
  busy = true; renderHome();
  try {
    if (!srv) { srv = await best(); if (!srv) { toast(t('nook')); return; } }
    S.last = srv; save(); log('connect ' + srv.host);
    const r = await window.api.connect({ host: srv.host, user: srv.user, pass: srv.pass, sites: S.sites });
    connected = !!r.ok;
    if (r.ok) log('connected; direct IPs: ' + r.bypassed); else { toast(t('fail')); log(r.error); }
  } finally { busy = false; renderHome(); }
}
$('big').addEventListener('click', async () => {
  if (busy) return;
  if (connected) { busy = true; renderHome(); await window.api.disconnect(); connected = false; busy = false; log('disconnected'); renderHome(); }
  else go(S.last);
});
$('free').addEventListener('click', async () => { if (busy) return; busy = true; renderHome(); const s = await best(); busy = false; go(s); });
$('change').addEventListener('click', () => show('servers'));
$('add').addEventListener('click', () => {
  const v = normSite($('site-in').value);
  if (!v) return toast(t('inv'));
  if (!S.sites.includes(v)) { S.sites.push(v); save(); renderSites(); if (connected) toast(t('rec')); }
  $('site-in').value = '';
});
$('site-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('add').click(); });
$('l-en').addEventListener('click', () => { S.lang = 'en'; save(); applyLang(); });
$('l-fa').addEventListener('click', () => { S.lang = 'fa'; save(); applyLang(); });
document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));

(async () => {
  const saved = (await window.api.get()) || {};
  S = { ...S, ...saved };
  if (!Array.isArray(S.sites)) { S.sites = [...DEFAULT_SITES]; save(); }
  show('home'); applyLang();
  connected = await window.api.status(); renderHome();
  loadServers();
  setInterval(async () => { if (busy) return; const c = await window.api.status(); if (c !== connected) { connected = c; renderHome(); } }, 5000);
})();
