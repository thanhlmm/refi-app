const { ipcRenderer } = require('electron')
const ipc = require('node-ipc')
const uuid = require('uuid')
const ContextMenu = require("secure-electron-context-menu").default;

let resolveSocketPromise
let socketPromise = new Promise(resolve => {
  resolveSocketPromise = resolve
})

ipcRenderer.on('set-socket', (event, { name }) => {
  resolveSocketPromise(name)
})

window.ipc = {
  getServerSocket: () => {
    return socketPromise
  },
  ipcConnect: (id, func, buffer = false) => {
    ipc.config.silent = true;
    ipc.config.rawBuffer = buffer;

    ipc.connectTo(id, () => {
      func(ipc.of[id])
    })
  },
  uuid: uuid
}

window.api = {
  contextMenu: ContextMenu.preloadBindings(ipcRenderer)
}

console.log('Done preload client');
