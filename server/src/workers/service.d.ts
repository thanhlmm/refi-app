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

interface IIpcTransport {
  send: (topic: string, arg: any) => void
}

interface IServiceContext {
  userDataPath: string;
  localDB: Lowdb.LowdbSync<LocalDB.IDatabase>
  ipc: IIpcTransport
}