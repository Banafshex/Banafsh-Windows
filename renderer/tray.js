const $ = (id) => document.getElementById(id);
let fa = true;

const copy = {
  fa: { connected: 'متصل', offline: 'قطع شده', connect: 'اتصال', disconnect: 'قطع اتصال', open: 'باز کردن', quit: 'خروج' },
  en: { connected: 'Connected', offline: 'Disconnected', connect: 'Connect', disconnect: 'Disconnect', open: 'Open', quit: 'Quit' }
};

function applyText() {
  const c = copy[fa ? 'fa' : 'en'];
  $('toggle').textContent = c.connect;
  $('open').textContent = c.open;
  $('quit').textContent = c.quit;
}

function render(state = {}) {
  const connected = !!state.connected;
  const busy = !!state.busy;
  const c = copy[fa ? 'fa' : 'en'];
  $('dot').className = 'dot ' + (connected ? 'ok' : 'off');
  $('status').textContent = connected ? c.connected : c.offline;
  $('toggle').textContent = connected ? c.disconnect : c.connect;
  $('toggle').disabled = busy;
  $('toggle').classList.toggle('busy', busy);
}

$('toggle').addEventListener('click', () => window.api.trayAction('toggle'));
$('open').addEventListener('click', () => window.api.trayAction('open'));
$('quit').addEventListener('click', () => window.api.trayAction('quit'));

window.api.onTrayState(render);
window.api.get().then((s) => {
  fa = s?.lang !== 'en';
  document.documentElement.lang = fa ? 'fa' : 'en';
  document.documentElement.dir = fa ? 'rtl' : 'ltr';
  applyText();
});
