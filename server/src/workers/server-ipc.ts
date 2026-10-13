import log from 'electron-log';
import type { MessagePortMain } from 'electron';

const tabName = process.argv[4];

let currentPort: MessagePortMain | null = null;

const post = (port: MessagePortMain, msg: object) => {
  log.debug(`${tabName} worker -> page`, msg);
  port.postMessage(msg);
};

export function init(handlers: Record<string, Function>) {
  const handleRequest = (port: MessagePortMain, msg: { id: string, name: string, args: any }) => {
    log.debug(`${tabName} page -> worker`, msg);
    const { id, name, args } = msg

    if (handlers[name]) {
      handlers[name](args).then(
        (result: any) => {
          post(port, { type: 'reply', id, result })
        },
        (error: Error) => {
          log.verbose('this is error throw to client');
          log.error(error);
          post(port, { type: 'error', id, message: error.message })
          throw error
        }
      )
    } else {
      console.warn('Unknown method: ' + name)
      post(port, { type: 'reply', id, result: null })
    }
  };

  process.parentPort.on('message', (event) => {
    if (event.data?.type !== 'port') {
      return;
    }

    const [port] = event.ports;
    currentPort?.close();
    currentPort = port;
    port.on('message', (portEvent) => handleRequest(port, portEvent.data));
    port.start();
  });

  process.parentPort.postMessage({ type: 'ready' })
}

interface ISendOption {
  firestore: boolean
}

export function send(name: string, args: any, option: ISendOption = { firestore: false }) {
  if (currentPort) {
    post(currentPort, { type: 'push', name, args, option })
  }
}

export default { init, send }
