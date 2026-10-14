import log from 'electron-log';
import * as path from 'path';
import { workerArgs } from './args';

// A utility process can't ask Electron for userData; main passes it as cwd
log.transports.file.resolvePath = () => path.join(process.cwd(), 'logs', 'worker.log');

if (!workerArgs.isDev) {
  log.transports.file.level = 'verbose';
}

// TODO: Check is dev to enable source-map-support
// require('source-map-support').install();
process.on('unhandledRejection', (error) => {
  log.error('unhandledRejection');
  log.error(error)
});

import serverHandlers from './server-handlers';
import ipc from './server-ipc';

log.info("Starting IPC server");
log.debug(workerArgs);
ipc.init(serverHandlers);

log.info(`Initiated IPC server v${workerArgs.version}`);
