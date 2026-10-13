declare namespace NSFireStore {
  interface IListenerEntity {
    id: string;
    topic: string;
    close: Function;
  }
}
