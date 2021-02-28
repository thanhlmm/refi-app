// require('source-map-support').install();
process.on('unhandledRejection', console.log);

import serverHandlers from './server-handlers';
import ipc from './server-ipc';

let isDev, version;

if (process.argv[2] === "--subprocess") {
  isDev = false;
  version = process.argv[3];

  let socketName = process.argv[4];
  ipc.init(socketName, serverHandlers);
} else {
  let { ipcRenderer, remote } = require("electron");
  isDev = true;
  version = remote.app.getVersion();

  ipcRenderer.on("set-socket", (event: any, { name }: { name: string }) => {
    ipc.init(name, serverHandlers);
  });
}

console.log(`Initiated IPC server v${version}`);
