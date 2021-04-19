const { ipcRenderer } = require('electron')
const ContextMenu = require("./lib/electron-context-menu").default;
const os = require("os"); // Comes with node.js
const { webFrame } = require('electron')

window.os = os.type()

window.api = {
  contextMenu: ContextMenu.preloadBindings(ipcRenderer),
  webFrame: {
    setZoomFactor: (factor) => {
      webFrame.setZoomFactor(factor)
    },
    getZoomFactor: () => webFrame.getZoomFactor()
  },
  newTab: (url) => {
    ipcRenderer.invoke('new-tab', url);
  },
  onTabChange: (cb) => {
    ipcRenderer.on('tabChange', (event, tabList) => {
      if (cb) {
        cb(tabList);
      }
    })
  },
  getTabs: () => {
    return ipcRenderer.invoke('get-tabs');
  },
  setTab: (tab) => {
    return ipcRenderer.invoke('set-tab', tab);
  },
  closeTab: (tab) => {
    return ipcRenderer.invoke('close-tab', tab);
  }
}

console.log('Done preload client');
