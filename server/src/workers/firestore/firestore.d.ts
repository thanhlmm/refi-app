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

  interface IService {
    init(params: NSFireStore.IFSInit): Promise<boolean>;
    subscribeDoc(params: NSFireStore.IDocSubscribe): Promise<IListenerKey>;
    subscribeCollection(params: NSFireStore.ICollectionSubscribe): Promise<IListenerKey>;
    subscribePathExplorer(params: NSFireStore.IPathSubscribe): Promise<IListenerKey>;
    updateDocs({ docs }: NSFireStore.IUpdateDocs): Promise<boolean>;
    unsubscribe(params: IListenerKey): Promise<boolean>;
  }
}