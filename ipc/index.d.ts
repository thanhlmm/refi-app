export interface IStoreKey {
  file: string;
}

export interface ICertificateData {
  projectId: string;
  keyPath: string;
}

export interface IRemoveKey {
  projectId: string;
}

export interface IListenerKey {
  id: string;
}

export interface IDocSubscribe {
  path: string;
  topic: string;
}

export type WhereFilterOp =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "in"
  | "not-in"
  | "array-contains-any";

export interface IOperator {
  type: WhereFilterOp;
  values: any;
}

export interface IQueryEntity {
  id: string;
  field: string;
  operator: IOperator;
}

export interface ISorterEntity {
  id: string;
  field: string;
  sort: "asc" | "desc";
}

export interface ICollectionSubscribe {
  path: string;
  topic: string;
  queryOptions: IQueryEntity[];
  sortOptions: ISorterEntity[];
  queryVersion?: number;
  endBefore?: string;
  startAfter?: string;
  endAt?: string;
  startAt?: string;
}

export interface IPathSubscribe {
  path: string;
  topic: string;
}

export interface IFSInit {
  projectId: string;
}

export interface IUpdateDocs {
  docs: string;
}

export interface IGetDocs {
  docs: string[];
}

export interface IAddDoc {
  doc: any;
  path: string;
}

export interface IAddDocs {
  docs: string;
}

export interface IRemoveDocs {
  docs: string[];
}

export interface IRemoveCollections {
  collections: string[];
}

export interface IImportDocs {
  docs: any[];
  path: string;
  option?: {
    idField?: string;
    autoParseJSON?: boolean;
  };
}

export interface IExportCollection {
  path: string;
}

export interface IExportCollectionResponse {
  docs: string;
}

export interface IPathExpander {
  path: string;
}

export interface WorkerRequests {
  "cert.storeKey": { args: IStoreKey; result: boolean };
  "cert.getKeys": { args: void; result: ICertificateData[] };
  "cert.removeKey": { args: IRemoveKey; result: boolean };
  "fs.init": { args: IFSInit; result: string[] };
  "fs.queryDoc.subscribe": { args: IDocSubscribe; result: IListenerKey };
  "fs.queryCollection.subscribe": { args: ICollectionSubscribe; result: IListenerKey };
  "fs.pathExplorer.subscribe": { args: IPathSubscribe; result: IListenerKey };
  "fs.updateDocs": { args: IUpdateDocs; result: boolean };
  "fs.addDoc": { args: IAddDoc; result: string };
  "fs.addDocs": { args: IAddDocs; result: boolean };
  "fs.deleteDocs": { args: IRemoveDocs; result: boolean };
  "fs.deleteCollections": { args: IRemoveCollections; result: boolean };
  "fs.importDocs": { args: IImportDocs; result: boolean };
  "fs.exportCollection": { args: IExportCollection; result: IExportCollectionResponse };
  "fs.getDocs": { args: IGetDocs; result: string };
  "fs.unsubscribe": { args: IListenerKey; result: boolean };
  "fs.pathExpander": { args: IPathExpander; result: string[] };
  "fs.getSimulatorData": { args: void; result: any };
}
