const { contextBridge, ipcRenderer: i } = require('electron');
contextBridge.exposeInMainWorld('api', {
  servers: () => i.invoke('servers:load'),
  test: (h) => i.invoke('servers:test', h),
  connect: (o) => i.invoke('vpn:connect', o),
  disconnect: () => i.invoke('vpn:disconnect'),
  status: () => i.invoke('vpn:status'),
  get: () => i.invoke('settings:get'),
  set: (s) => i.invoke('settings:set', s)
});
