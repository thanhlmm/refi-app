declare namespace NSFireStore {
  interface IListenerEntity {
    id: string;
    topic: string;
    close: Function;
  }

  interface IListenerKey {
    id: string;
  }

  interface IDocSubscribe {
    path: string;
    topic: string;
  }

  interface ICollectionSubscribe {
    path: string;
    topic: string;
    queryOptions: IQueryEntity[]
    sortOptions: ISorterEntity[]
  }

  interface IQueryEntity {
    id: string;
    field: string;
    operator: IOperator;
  }

  export interface ISorterEntity {
    id: string;
    field: string;
    sort: "ASC" | "DESC";
  }

  type WhereFilterOp =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'not-in'
    | 'array-contains-any';

  interface IOperator {
    type: WhereFilterOp;
    values: any;
  }

  interface IPathSubscribe {
    path: string;
    topic: string;
  }

  interface IFSInit {
    projectId: string;
  }

  interface IUpdateDocs {
    docs: string;
  }

  interface IGetDocs {
    docs: string[];
  }

  interface IAddDoc {
    doc: any;
    path: string;
  }

  interface IPathExpander {
    path: string;
  }

  interface IService {
    init(params: NSFireStore.IFSInit): Promise<string[]>;
    subscribeDoc(params: NSFireStore.IDocSubscribe): Promise<IListenerKey>;
    subscribeCollection(params: NSFireStore.ICollectionSubscribe): Promise<IListenerKey>;
    subscribePathExplorer(params: NSFireStore.IPathSubscribe): Promise<IListenerKey>;
    updateDocs({ docs }: NSFireStore.IUpdateDocs): Promise<boolean>;
    addDoc({ doc, path }: NSFireStore.IAddDoc): Promise<string>
    getDocs(params: NSFireStore.IGetDocs): Promise<string>;
    unsubscribe(params: IListenerKey): Promise<boolean>;
    pathExpander(params: NSFireStore.IPathExpander): Promise<string[]>;
  }
}