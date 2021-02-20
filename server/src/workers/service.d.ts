declare namespace FireService {
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

  interface IListenerEntity {
    id: string;
    topic: string;
    close: Function;
  }

  interface IUnsubscribe {
    id: string
  }

  interface IFSInit {
    projectId: string;
  }

  interface IStoreKey {
    file: string;
  }
}