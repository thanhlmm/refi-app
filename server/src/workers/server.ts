import log from 'electron-log';
// TODO: Check is dev to enable source-map-support
// require('source-map-support').install();
process.on('unhandledRejection', (error) => {
  log.error('unhandledRejection');
  log.error(error)
});

import serverHandlers from './server-handlers';
import ipc from './server-ipc';

log.info("Starting IPC server");
log.debug(process.argv);
const version = process.argv[3];
ipc.init(serverHandlers);

log.info(`Initiated IPC server v${version}`);
