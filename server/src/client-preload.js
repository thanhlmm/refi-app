const { ipcRenderer, shell } = require('electron')
const uuid = require('uuid')
const ContextMenu = require("./lib/electron-context-menu").default;
const os = require("os"); // Comes with node.js
const { webFrame } = require('electron')

window.ipc = {
  request: (msg) => ipcRenderer.send('worker-request', msg),
  onMessage: (cb) => ipcRenderer.on('worker-message', (event, msg) => cb(msg)),
  uuid: uuid
}

window.os = os.type()

window.api = {
  contextMenu: ContextMenu.preloadBindings(ipcRenderer),
  openUrl: (url) => shell.openExternal(url),
  webFrame: {
    setZoomFactor: (factor) => {
      webFrame.setZoomFactor(factor)
    },
    getZoomFactor: () => webFrame.getZoomFactor()
  },
  newTab: () => {
    ipcRenderer.invoke('new-tab', window.location.href);
  },
  renameTab: (name) => {
    return ipcRenderer.invoke('rename-tab', name);
  },
}

console.log('Done preload client');
