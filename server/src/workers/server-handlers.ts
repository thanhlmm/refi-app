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

handlers["cert.storeKey"] = certService.storeKey.bind(certService);
handlers["cert.getKeys"] = certService.getKeys.bind(certService);
handlers["cert.removeKey"] = certService.removeKey.bind(certService);

handlers["fs.init"] = fsService.init.bind(fsService);
handlers["fs.queryDoc.subscribe"] = fsService.subscribeDoc.bind(fsService);
handlers["fs.queryCollection.subscribe"] = fsService.subscribeCollection.bind(fsService);
handlers["fs.pathExplorer.subscribe"] = fsService.subscribePathExplorer.bind(fsService);
handlers["fs.updateDocs"] = fsService.updateDocs.bind(fsService);
handlers["fs.addDoc"] = fsService.addDoc.bind(fsService);
handlers["fs.getDocs"] = fsService.getDocs.bind(fsService);
handlers["fs.unsubscribe"] = fsService.unsubscribe.bind(fsService);
handlers['fs.pathExpander'] = fsService.pathExpander.bind(fsService);

export default handlers;
