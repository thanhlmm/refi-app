const { ipcRenderer } = require('electron')
const ipc = require('node-ipc')
const uuid = require('uuid')

let resolveSocketPromise
let socketPromise = new Promise(resolve => {
  resolveSocketPromise = resolve
})

window.IS_DEV = process.env.ELECTRON_IS_DEV // TODO: Remove hardcode

window.getServerSocket = () => {
  return socketPromise
}

ipcRenderer.on('set-socket', (event, { name }) => {
  resolveSocketPromise(name)
})

window.ipcConnect = (id, func, buffer = false) => {
  const ipcInstance = new RawIPC.IPC;
  ipcInstance.config.silent = true;
  ipcInstance.config.rawBuffer = buffer;

  ipcInstance.connectTo(id, () => {
    func(ipcInstance.of[id])
  })
}

window.uuid = uuid

console.log('Done preload client');
