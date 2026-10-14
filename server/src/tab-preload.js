const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('platform', process.platform)

contextBridge.exposeInMainWorld('api', {
  newTab: (url) => ipcRenderer.invoke('new-tab', url),
  onTabChange: (cb) => {
    ipcRenderer.on('tabChange', (event, tabList) => {
      if (cb) {
        cb(tabList)
      }
    })
  },
  getTabs: () => ipcRenderer.invoke('get-tabs'),
  setTab: (tab) => ipcRenderer.invoke('set-tab', tab),
  renameTab: (name) => ipcRenderer.invoke('rename-tab', name),
  closeTab: (tab) => ipcRenderer.invoke('close-tab', tab),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimumWindow: () => ipcRenderer.invoke('minimum-window'),
  toggleMaximumWindow: () => ipcRenderer.invoke('toggle-maximum-window'),
})
