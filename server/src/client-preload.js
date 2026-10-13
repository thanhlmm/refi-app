const { contextBridge, ipcRenderer, webFrame } = require('electron')

// Channel names must match lib/electron-context-menu
const contextMenuRequest = 'ContextMenu-Request'
const contextMenuResponse = 'ContextMenu-Response'
const contextMenuClicked = 'ContextMenu-Clicked'

const templateAttribute = 'data-cm-template'
const payloadAttribute = 'data-cm-payload'
const idAttribute = 'data-cm-id'

let menuId = ''
let selectedElementAttributes = {}
let contextMenuParams = {}
let callbacks = {}

const findContextElement = (element, x, y) => {
  if (!element) {
    return null
  }

  const { top, left, right, bottom } = element.getBoundingClientRect()
  if (x < left || x > right || y < top || y > bottom) {
    return null
  }

  const template = element.getAttribute(templateAttribute)
  if (template !== '' && template !== null) {
    return element
  }

  return findContextElement(element.parentElement, x, y)
}

const onContextMenuRequest = (event, args) => {
  let template = null
  selectedElementAttributes = {}
  contextMenuParams = args.params

  const element = findContextElement(document.elementFromPoint(args.params.x, args.params.y), args.params.x, args.params.y)
  if (element !== null) {
    const elementTemplate = element.getAttribute(templateAttribute)
    if (elementTemplate !== '' && elementTemplate !== null) {
      for (const attribute of element.attributes) {
        if (attribute.name.indexOf(payloadAttribute) >= 0) {
          selectedElementAttributes[attribute.name.replace(`${payloadAttribute}-`, '')] = attribute.value
        } else if (attribute.name.indexOf(idAttribute) >= 0) {
          menuId = attribute.value
        }
      }
      template = elementTemplate
    }
  }

  ipcRenderer.send(contextMenuResponse, { id: menuId, params: args.params, template })
}

const onContextMenuClicked = (event, args) => {
  if (typeof callbacks[args.id] !== 'undefined') {
    callbacks[args.id]({ params: contextMenuParams, attributes: selectedElementAttributes })
  }
}

ipcRenderer.on(contextMenuRequest, onContextMenuRequest)
ipcRenderer.on(contextMenuClicked, onContextMenuClicked)

const contextMenu = {
  onReceive: (actionId, func, id) => {
    callbacks[id === undefined ? actionId : `${id}___${actionId}`] = func
  },
  clearRendererBindings: (actionId, id) => {
    if (actionId) {
      delete callbacks[id === undefined ? actionId : `${id}___${actionId}`]
      return
    }

    callbacks = {}
    contextMenuParams = {}
    menuId = ''
  },
}

contextBridge.exposeInMainWorld('ipc', {
  request: (msg) => ipcRenderer.send('worker-request', msg),
  onMessage: (cb) => ipcRenderer.on('worker-message', (event, msg) => cb(msg)),
})

contextBridge.exposeInMainWorld('platform', process.platform)

contextBridge.exposeInMainWorld('api', {
  contextMenu,
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  webFrame: {
    setZoomFactor: (factor) => webFrame.setZoomFactor(factor),
    getZoomFactor: () => webFrame.getZoomFactor(),
  },
  newTab: () => ipcRenderer.invoke('new-tab', window.location.href),
  renameTab: (name) => ipcRenderer.invoke('rename-tab', name),
})
