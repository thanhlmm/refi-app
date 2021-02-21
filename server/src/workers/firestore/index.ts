import * as admin from "firebase-admin";
import { IServiceContext } from "../service";
import { getDocMetaData, postConverter } from "../../utils/converter";
import uuid from 'uuid';


export default class FireStoreService implements NSFireStore.IService {
  private ctx: IServiceContext;
  private app: admin.app.App;
  private listListeners: NSFireStore.IListenerEntity[] = [];

  constructor(ctx: IServiceContext) {
    this.ctx = ctx;
  }

  private fsClient() {
    return admin.firestore();
  }

  public async init({ projectId }: NSFireStore.IFSInit) {
    const cert = this.ctx.localDB.get('keys').find({ projectId }).value();
    const serviceAccount = require(cert.keyPath);
    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log("Initiated firebase app");
    return true;

  }

  public async subscribeDoc({ path, topic }: NSFireStore.IDocSubscribe) {
    console.log("received event fs.query.subscribe", { path, topic });
    const close = this.fsClient()
      .doc(path)
      .withConverter(postConverter)
      .onSnapshot(
        async function (doc) {
          this.ctx.ipc.send(topic, doc.data());

          const collections = await doc.ref.listCollections();
          this.ctx.ipc.send(
            `${topic}_metadata`,
            collections.map((collection) => ({
              id: collection.id,
              path: collection.path,
            }))
          );
        },
        (error) => {
          // TODO: Handle errors here.
          // Ref: https://firebase.google.com/docs/firestore/query-data/queries#compound_queries
        }
      );

    const listenerData = {
      id: uuid.v4(),
      topic,
      close,
    };
    this.listListeners.push(listenerData);

    return { id: listenerData.id };
  }

  public async subscribeCollection({ path, topic }: NSFireStore.ICollectionSubscribe) {
    console.log("received event fs.query.subscribe", { path, topic });
    const close = this.fsClient()
      .collection(path)
      .withConverter(postConverter)
      .onSnapshot(
        async function (querySnapshot) {
          const data: any[] = [];
          querySnapshot.forEach((doc) => {
            data.push(doc.data());
          });

          this.ctx.ipc.send(topic, data);
        },
        (error) => {
          // TODO: Handle error
        }
      );

    const listenerData = {
      id: uuid.v4(),
      topic,
      close,
    };
    this.listListeners.push(listenerData);

    return { id: listenerData.id };
  };

  public async subscribePathExplorer({ path, topic }: NSFireStore.IPathSubscribe) {
    console.log("received event fs.pathExplorer", { path, topic });
    const close = this.fsClient()
      .collection(path)
      .withConverter(postConverter)
      .onSnapshot(
        async function (querySnapshot) {
          const data: any[] = [];
          querySnapshot.forEach((doc) => {
            data.push(getDocMetaData(doc));
          });

          this.ctx.ipc.send(topic, data);
        },
        (error) => {
          // TODO: Handle error
        }
      );

    const listenerData = {
      id: uuid.v4(),
      topic,
      close,
    };
    this.listListeners.push(listenerData);

    return { id: listenerData.id };
  };

  public async unsubscribe({ id }: NSFireStore.IListenerKey) {
    const dataSource = this.listListeners.filter((doc) => doc.id === id);
    dataSource.forEach((source) => {
      source.close();
    });

    this.listListeners = this.listListeners.filter((doc) => doc.id !== id);
    console.log("Success unsubscribe this stream");
    return true;
  };
}