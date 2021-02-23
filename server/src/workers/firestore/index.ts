import * as admin from "firebase-admin";
import { IServiceContext } from "../service";
import { getDocMetaData } from "../../utils/converter";
import uuid from 'uuid';
import { serializeDocumentSnapshot, serializeQuerySnapshot } from "firestore-serializers";


export default class FireStoreService implements NSFireStore.IService {
  private ctx: IServiceContext;
  private app: admin.app.App;
  private listListeners: NSFireStore.IListenerEntity[] = [];

  static addMetadata(doc: any) {
    doc.metadata = {
      hasPendingWrites: false,
      fromCache: false,
      isEqual(arg: any) {
        return true;
      }
    }

    return doc;
  }

  constructor(ctx: IServiceContext) {
    this.ctx = ctx;
  }

  private fsClient() {
    return admin.firestore(this.app)
  }

  public async init({ projectId }: NSFireStore.IFSInit) {
    if (this.app?.name === projectId) {
      console.log(`${projectId} already initiated`);
      return;
    }

    const cert = this.ctx.localDB.get('keys').find({ projectId }).value();
    const serviceAccount = require(cert.keyPath);
    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    }, projectId);

    console.log("Initiated firebase app");
    return true;

  }

  public async subscribeDoc({ path, topic }: NSFireStore.IDocSubscribe) {
    console.log("received event fs.query.subscribe", { path, topic });
    const close = this.fsClient()
      .doc(path)
      // .withConverter(postConverter)
      .onSnapshot(
        async (doc) => {
          const docData = serializeDocumentSnapshot(doc as any);
          this.ctx.ipc.send(topic, docData, { firestore: true });

          // TODO: Consider fetch `listCollections` outsite
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
      .onSnapshot(
        async (querySnapshot) => {
          const data = serializeQuerySnapshot(querySnapshot as any);

          this.ctx.ipc.send(topic, data, { firestore: true });
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
      .onSnapshot(
        async (querySnapshot) => {
          const data: any[] = [];
          querySnapshot.forEach((doc) => {
            data.push(getDocMetaData(doc));
          });

          this.ctx.ipc.send(topic, data, { firestore: true });
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