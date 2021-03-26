const ipc = require('node-ipc');
import log from 'electron-log';

ipc.config.silent = true;

function isSocketTaken(name: string) {
  return new Promise((resolve, reject) => {
    ipc.connectTo(name, () => {
      ipc.of[name].on('error', () => {
        ipc.disconnect(name);
        resolve(false);
      });

      ipc.of[name].on('connect', () => {
        ipc.disconnect(name);
        resolve(true);
      });
    });
  });
}

export default async function findOpenSocket() {
  let currentSocket = 1;
  log.verbose('checking', currentSocket);
  while (await isSocketTaken(`refiapp_${currentSocket}`)) {
    currentSocket++;
    log.verbose('checking', currentSocket);
  }
  log.verbose('found socket', currentSocket);
  return `refiapp_${currentSocket}`;
}
