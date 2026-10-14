import type { WorkerRequests } from "refi-ipc";
import { send } from "./server-ipc";
import db from '../client/db';
import { IServiceContext } from './service';
import FireStoreService from './firestore';
import CertService from './cert';

const userDataPath = process.cwd();

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

const handlers: {
  [Name in keyof WorkerRequests]: (args: WorkerRequests[Name]["args"]) => Promise<WorkerRequests[Name]["result"]>
} = {
  "cert.storeKey": certService.storeKey.bind(certService),
  "cert.getKeys": certService.getKeys.bind(certService),
  "cert.removeKey": certService.removeKey.bind(certService),

  "fs.init": fsService.init.bind(fsService),
  "fs.queryDoc.subscribe": fsService.subscribeDoc.bind(fsService),
  "fs.queryCollection.subscribe": fsService.subscribeCollection.bind(fsService),
  "fs.pathExplorer.subscribe": fsService.subscribePathExplorer.bind(fsService),
  "fs.updateDocs": fsService.updateDocs.bind(fsService),
  "fs.addDoc": fsService.addDoc.bind(fsService),
  "fs.addDocs": fsService.addDocs.bind(fsService),
  "fs.deleteDocs": fsService.deleteDocs.bind(fsService),
  "fs.deleteCollections": fsService.deleteCollections.bind(fsService),
  "fs.importDocs": fsService.importDocs.bind(fsService),
  "fs.exportCollection": fsService.exportCollection.bind(fsService),
  "fs.getDocs": fsService.getDocs.bind(fsService),
  "fs.unsubscribe": fsService.unsubscribe.bind(fsService),
  "fs.pathExpander": fsService.pathExpander.bind(fsService),
  "fs.getSimulatorData": fsService.getSimulatorData.bind(fsService),
};

export default handlers;
