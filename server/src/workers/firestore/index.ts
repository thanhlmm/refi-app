import * as admin from "firebase-admin";
import { IServiceContext } from "../service";
import { getDocMetaData } from "../../utils/converter";
import { v4 as uuidv4 } from 'uuid';
import { deserializeDocumentSnapshotArray, DocumentSnapshot, serializeDocumentSnapshot, serializeQuerySnapshot } from "firestore-serializers";
import { isCollection } from "../../utils/navigator";

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

  public async init({ projectId }: NSFireStore.IFSInit): Promise<string[]> {
    if (this.app?.name === projectId) {
      console.log(`${projectId} already initiated`);
      const collections = await this.fsClient().listCollections();
      return collections.map(collection => collection.path)
    }

    const cert = this.ctx.localDB.get('keys').find({ projectId }).value();
    const serviceAccount = require(cert.keyPath);
    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    }, projectId);

    console.log("Initiated firebase app");
    const collections = await this.fsClient().listCollections();
    return collections.map(collection => collection.path)
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
      id: uuidv4(),
      topic,
      close,
    };
    this.listListeners.push(listenerData);

    return { id: listenerData.id };
  }

  public async subscribeCollection({ path, topic, queryOptions, sortOptions }: NSFireStore.ICollectionSubscribe) {
    console.log("received event fs.queryCollection.subscribe", { path, topic });
    console.log(sortOptions);

    const collectionRef = this.fsClient()
      .collection(path);

    let querier: FirebaseFirestore.Query = collectionRef;

    queryOptions.forEach(({ field, operator: { type, values } }) => {
      querier = querier.where(field, type, values);
    })

    sortOptions.forEach(({ field, sort }) => {
      querier = querier.orderBy(field, sort.toLowerCase() as FirebaseFirestore.OrderByDirection);
    })

    console.time('Query time');

    const close = querier.onSnapshot(
      async (querySnapshot) => {
        const docChanges = querySnapshot.docChanges();
        const addedData = serializeQuerySnapshot({
          docs: docChanges.filter(changes => changes.type === 'added').map(changes => changes.doc)
        })

        const modifiedData = serializeQuerySnapshot({
          docs: docChanges.filter(changes => changes.type === 'modified').map(changes => changes.doc)
        })

        const removedData = serializeQuerySnapshot({
          docs: docChanges.filter(changes => changes.type === 'removed').map(changes => changes.doc)
        })

        console.time('Query time');
        console.log(`send to ${topic} with ${docChanges.length} changes`)

        this.ctx.ipc.send(topic, { addedData, modifiedData, removedData, totalDocs: docChanges.length }, { firestore: true });
      }
    );
    // TODO: Handle error

    const listenerData = {
      id: uuidv4(),
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
      id: uuidv4(),
      topic,
      close,
    };
    this.listListeners.push(listenerData);

    return { id: listenerData.id };
  };

  public async updateDocs({ docs }: NSFireStore.IUpdateDocs): Promise<boolean> {
    const fs = this.fsClient();
    const docsSnapshot = deserializeDocumentSnapshotArray(docs, admin.firestore.GeoPoint, admin.firestore.Timestamp, path => fs.doc(path))
    try {
      await fs.runTransaction(async (tx) => {
        docsSnapshot.forEach(docSnapshot => {
          console.log(docSnapshot.data());
          tx.set(fs.doc(docSnapshot.ref.path), docSnapshot.data())
        })
      });

      console.log('Transaction success!');
    } catch (e) {
      console.log('Transaction failure:', e);
      throw e;
    }
    return true;
  };

  public async unsubscribe({ id }: NSFireStore.IListenerKey) {
    const dataSource = this.listListeners.filter((doc) => doc.id === id);
    dataSource.forEach((source) => {
      console.log(source);
      source.close();
    });

    this.listListeners = this.listListeners.filter((doc) => doc.id !== id);
    console.log("Success unsubscribe this stream");
    return true;
  };

  public async addDoc({ doc, path }: NSFireStore.IAddDoc): Promise<string> {
    const fs = this.fsClient();
    const newDoc = await fs.collection(path).add(doc);

    return newDoc.path;
  }

  public async addDocs({ docs }: NSFireStore.IAddDocs): Promise<boolean> {
    const fs = this.fsClient();
    const docsSnapshot = deserializeDocumentSnapshotArray(docs, admin.firestore.GeoPoint, admin.firestore.Timestamp, path => fs.doc(path))
    const batch = fs.batch();
    docsSnapshot.forEach((doc) => {
      const newDocRef = fs.doc(doc.ref.path);
      batch.set(newDocRef, doc.data())
    })

    await batch.commit();
    return true
  }

  public async deleteDocs({ docs }: NSFireStore.IRemoveDocs): Promise<boolean> {
    const fs = this.fsClient();
    const batch = fs.batch();
    docs.forEach((path) => {
      const newDocRef = fs.doc(path);
      batch.delete(newDocRef)
    })

    await batch.commit();
    return true;
  }

  public async importDocs({ docs, path }: NSFireStore.IImportDocs): Promise<boolean> {
    const fs = this.fsClient();
    const collection = fs.collection(path);
    const batch = fs.batch();
    // TODO: What is we have more than 500 document?
    docs.forEach((doc) => {
      const newDocRef = collection.doc();
      batch.set(newDocRef, doc)
    })

    await batch.commit();
    return true
  }

  public async exportCollection({ path }: NSFireStore.IExportCollection): Promise<NSFireStore.IExportCollectionResponse> {
    const fs = this.fsClient();
    return fs.collection(path).get().then(querySnapshot => {
      const docs = serializeQuerySnapshot(querySnapshot);
      return {
        docs: docs
      }
    });
  }

  public async getDocs({ docs }: NSFireStore.IGetDocs): Promise<string> {
    const fs = this.fsClient();
    const docsSnapshot = await Promise.all(docs.map(doc => fs.doc(doc).get()))
    return serializeQuerySnapshot({
      docs: docsSnapshot
    });
  };

  public async getDocsByCollection({ path }: { path: string }): Promise<string> {
    const fs = this.fsClient();
    const docsSnapshot = await fs.collection(path).get()
    return serializeQuerySnapshot(docsSnapshot);
  };

  public async pathExpander({ path }: { path: string }): Promise<string[]> {
    const fs = this.fsClient();
    const isCollectionPath = isCollection(path);
    console.log({ path, isCollectionPath });
    if (isCollectionPath) {
      const docsSnapshot = await fs.collection(path).get()
      return docsSnapshot.docs.map(doc => doc.ref.path);
    }

    const listCollections = await fs.doc(path).listCollections();
    return listCollections.map(collection => collection.path);
  }
}