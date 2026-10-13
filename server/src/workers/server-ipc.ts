import log from 'electron-log';

export function init(handlers: Record<string, Function>) {
  process.on('message', (msg: { id: string, name: string, args: any }) => {
    const { id, name, args } = msg

    if (handlers[name]) {
      handlers[name](args).then(
        (result: any) => {
          process.send!({ type: 'reply', id, result })
        },
        (error: Error) => {
          log.verbose('this is error throw to client');
          log.error(error);
          process.send!({ type: 'error', id, message: error.message })
          throw error
        }
      )
    } else {
      console.warn('Unknown method: ' + name)
      process.send!({ type: 'reply', id, result: null })
    }
  })

  process.send!({ type: 'ready' })
}

interface ISendOption {
  firestore: boolean
}

export function send(name: string, args: any, option: ISendOption = { firestore: false }) {
  process.send!({ type: 'push', name, args, option })
}

export default { init, send }
