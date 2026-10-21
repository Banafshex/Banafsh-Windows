const { contextBridge, ipcRenderer: i } = require('electron');
contextBridge.exposeInMainWorld('api', {
  servers: () => i.invoke('servers:load'),
  test: (h, p) => i.invoke('servers:test', h, p),
  health: (results) => i.invoke('servers:health', results),
  connect: (o) => i.invoke('vpn:connect', o),
  disconnect: () => i.invoke('vpn:disconnect'),
  cancelReconnect: () => i.invoke('vpn:cancel-reconnect'),
  status: () => i.invoke('vpn:status'),
  get: () => i.invoke('settings:get'),
  set: (s) => i.invoke('settings:set', s),
  closeChoice: (choice, remember) => i.invoke('window:close-choice', choice, remember),
  onCloseRequest: (fn) => i.on('vpn:event', (_, data) => { if (data && data.type === 'closeRequest') fn(data); }),
  onStartup: (fn) => i.on('startup:progress', (_, data) => fn(data)),
  startupGet: () => i.invoke('startup:get'),
  minimize: () => i.invoke('window:minimize'),
  closeWindow: () => i.invoke('window:close'),
  onEvent: (fn) => i.on('vpn:event', (_, data) => fn(data))
});
