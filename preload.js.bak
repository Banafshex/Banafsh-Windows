const { contextBridge, ipcRenderer: i } = require('electron');
contextBridge.exposeInMainWorld('api', {
  servers: () => i.invoke('servers:load'),
  test: (h, p) => i.invoke('servers:test', h, p),
  health: (results) => i.invoke('servers:health', results),
  connect: (o) => i.invoke('vpn:connect', o),
  disconnect: () => i.invoke('vpn:disconnect'),
  status: () => i.invoke('vpn:status'),
  get: () => i.invoke('settings:get'),
  set: (s) => i.invoke('settings:set', s),
  onEvent: (fn) => i.on('vpn:event', (_, data) => fn(data))
});
