'use strict';

const { contextBridge, ipcRenderer: i } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Servers & probes
  servers: (protocol) => i.invoke('servers:load', protocol),
  test: (opts) => i.invoke('servers:test', opts),
  health: (protocol, results) => i.invoke('servers:health', protocol, results),
  verifyServerForProtocol: (protocol, host) => i.invoke('servers:verify-for-protocol', protocol, host),

  // VPN tunnel control & Direct (No VPN) routing
  connect: (opts) => i.invoke('vpn:connect', opts),
  disconnect: () => i.invoke('vpn:disconnect'),
  cancel: () => i.invoke('vpn:cancel'),
  status: () => i.invoke('vpn:status'),
  checkInternet: () => i.invoke('net:check'),
  syncBypass: () => i.invoke('bypass:sync'),

  // QR share & receive
  qrEncode: (server) => i.invoke('qr:encode', server),
  qrDecode: (text) => i.invoke('qr:decode', text),
  qrSaveSvg: (svg, host) => i.invoke('qr:save-svg', svg, host),

  // Profiles import / export
  exportProfile: (server) => i.invoke('profile:export', server),
  importProfile: () => i.invoke('profile:import'),

  // Settings & app info
  get: () => i.invoke('settings:get'),
  set: (s) => i.invoke('settings:set', s),
  appInfo: () => i.invoke('app:info'),
  openExternal: (url) => i.invoke('app:open-external', url),

  // Updates & news
  checkUpdate: (manual) => i.invoke('update:check', manual),
  downloadUpdate: (info) => i.invoke('update:download', info),
  cancelUpdateDownload: () => i.invoke('update:cancel-download'),
  installUpdate: (filePath) => i.invoke('update:install', filePath),
  checkNews: () => i.invoke('news:check'),

  // Logs
  getLogFile: () => i.invoke('log:get'),
  clearLogFile: () => i.invoke('log:clear'),
  revealLogFile: () => i.invoke('log:reveal'),

  // Window & startup controls
  closeChoice: (choice, remember) => i.invoke('window:close-choice', choice, remember),
  onCloseRequest: (fn) => i.on('vpn:event', (_, data) => { if (data && data.type === 'closeRequest') fn(data); }),
  onStartup: (fn) => i.on('startup:progress', (_, data) => fn(data)),
  startupGet: () => i.invoke('startup:get'),
  minimize: () => i.invoke('window:minimize'),
  closeWindow: () => i.invoke('window:close'),
  setWindowTheme: (isDark) => i.invoke('window:theme', isDark),
  onEvent: (fn) => i.on('vpn:event', (_, data) => fn(data))
});
