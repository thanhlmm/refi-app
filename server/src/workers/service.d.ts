import Lowdb from 'lowdb';

declare namespace LocalDB {
  interface IKey {
    keyPath: string;
    projectId: string;
  }

  interface IDatabase {
    keys: Array<IKey>;
  }
}

interface ISendOption {
  firestore: boolean
}

interface IIpcTransport {
  send: (topic: string, arg: any, option?: ISendOption) => void
}

interface IServiceContext {
  userDataPath: string;
  localDB: Lowdb.LowdbSync<LocalDB.IDatabase>
  ipc: IIpcTransport
}