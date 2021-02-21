import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import fs from 'fs';
import path from 'path';
import { LocalDB } from '../workers/service';

const db = (userDataPath: string) => {
  const dbFolderPath = path.join(userDataPath, 'DB');
  const dbPath = path.join(dbFolderPath, 'db.json');

  // Create folder
  fs.mkdirSync(dbFolderPath, { recursive: true });
  fs.closeSync(fs.openSync(dbPath, 'a'));
  console.log('Created db file');

  const adapter = new FileSync<LocalDB.IDatabase>(dbPath)
  const dbInstance = low(adapter)

  dbInstance.defaults({ keys: [] })
    .write();

  return dbInstance;
}

export default db;
