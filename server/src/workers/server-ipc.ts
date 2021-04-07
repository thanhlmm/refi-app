const ipc = require('node-ipc');
import log from 'electron-log';

export function init(socketName: string, handlers: Record<string, Function>, buffer = false) {
  ipc.config.id = socketName;
  ipc.config.silent = false;
  ipc.config.logger = log.debug;
  ipc.config.rawBuffer = buffer;

  ipc.serve(() => {
    ipc.server.on('message', (data: string, socket: any) => {
      let msg = JSON.parse(data)
      let { id, name, args } = msg

      if (handlers[name]) {
        handlers[name](args).then(
          (result: any) => {
            ipc.server.emit(
              socket,
              'message',
              JSON.stringify({ type: 'reply', id, result })
            )
          },
          (error: Error) => {
            log.verbose('this is error throw to client');
            log.error(error);
            ipc.server.emit(
              socket,
              'message',
              JSON.stringify({ type: 'error', id, message: error.message })
            )
            throw error
          }
        )
      } else {
        console.warn('Unknown method: ' + name)
        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({ type: 'reply', id, result: null })
        )
      }
    })
  })

  ipc.server.start()
}

interface ISendOption {
  firestore: boolean
}

export function send(name: string, args: any, option: ISendOption = { firestore: false }) {
  ipc.server.broadcast('message', JSON.stringify({ type: 'push', name, args, option }))
}

export default { init, send }