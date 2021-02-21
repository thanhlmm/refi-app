import { send } from "./server-ipc";
import db from '../client/db';
import { IServiceContext } from './service';
import FireStoreService from './firestore';
import CertService from './cert';

const userDataPath = process.cwd();
const handlers: Record<string, Function> = {};

// Create service context
const ctx: IServiceContext = {
  userDataPath,
  localDB: db(userDataPath),
  ipc: {
    send
  }
}

// Init service
const certService = new CertService(ctx);
const fsService = new FireStoreService(ctx);

handlers["cert.storeKey"] = certService.storeKey.bind(fsService);
handlers["fs.init"] = fsService.init.bind(certService);
handlers["fs.queryDoc.subscribe"] = fsService.subscribeDoc.bind(certService);
handlers["fs.queryCollection.subscribe"] = fsService.subscribeCollection.bind(certService);
handlers["fs.pathExplorer.subscribe"] = fsService.subscribePathExplorer.bind(certService);
handlers["fs.unsubscribe"] = fsService.unsubscribe.bind(certService);

export default handlers;
