import log from 'electron-log';
// TODO: Check is dev to enable source-map-support
// require('source-map-support').install();
log.verbose(process.env);
process.on('unhandledRejection', (error) => {
  log.error('unhandledRejection');
  log.error(error)
});

import serverHandlers from './server-handlers';
import ipc from './server-ipc';

let version;

log.info("Starting IPC server");
log.debug(process.argv);
if (process.argv[2] === "--subprocess") {
  version = process.argv[3];

  let socketName = process.argv[4];
  ipc.init(socketName, serverHandlers);
} else {
  let { ipcRenderer, remote } = require("electron");
  version = remote.app.getVersion();

  ipcRenderer.on("set-socket", (event: any, { name }: { name: string }) => {
    ipc.init(name, serverHandlers);
  });
}

log.info(`Initiated IPC server v${version}`);
