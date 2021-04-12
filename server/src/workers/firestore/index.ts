import * as admin from "firebase-admin";
import { IServiceContext } from "../service";
import { getDocMetaData } from "../../utils/converter";
import { v4 as uuidv4 } from 'uuid';
import { deserializeDocumentSnapshotArray, DocumentSnapshot, serializeDocumentSnapshot, serializeQuerySnapshot } from "firestore-serializers";
import { isCollection } from "../../utils/navigator";
import { chunk, get } from "lodash";
import log from 'electron-log';
import { isRangeFilter, parseEmulatorConnection } from "../../utils";
import axios from 'axios';

const DOCS_PER_PAGE = 200;

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
    if (projectId.includes(':')) {
      return await this.initEmulator({ projectId });
    }

    if (this.app?.name === projectId) {
      log.warn(`${projectId} already initiated`);
      const collections = await this.fsClient().listCollections();
      return collections.map(collection => collection.path)
    }

    const cert = this.ctx.localDB.get('keys').find({ projectId }).value();
    if (!cert) {
      throw new Error('We do not have credentials for this project')
    }
    const serviceAccount = require(cert.keyPath);

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    }, projectId);

    log.info("Initiated firebase app");
    const collections = await this.fsClient().listCollections();
    return collections.map(collection => collection.path)
  }

  public async initEmulator({ projectId: connection }: NSFireStore.IFSInit): Promise<string[]> {
    const { host, port, projectId } = parseEmulatorConnection(connection);
    try {
      await axios.get(`http://${host}:${port}`);
    } catch (error) {
      throw new Error('Can not connect. Please check the config to emulator')
    }
    process.env.FIRESTORE_EMULATOR_HOST = `${host}:${port}`;

    if (this.app?.name === projectId) {
      log.warn(`${host} already initiated`);
      const collections = await this.fsClient().listCollections();
      return collections.map(collection => collection.path)
    }

    this.app = admin.initializeApp({
      projectId,
    }, projectId);

    log.info("Initiated emulator firebase app");
    const collections = await this.fsClient().listCollections();
    return collections.map(collection => collection.path)
  }

  public async subscribeDoc({ path, topic }: NSFireStore.IDocSubscribe) {
    log.verbose("received event fs.query.subscribe", { path, topic });
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

  public async subscribeCollection({ path, topic, queryOptions, sortOptions, queryVersion, startAfter, endBefore, startAt, endAt }: NSFireStore.ICollectionSubscribe) {
    log.verbose("received event fs.queryCollection.subscribe", { path, topic });
    log.verbose(sortOptions);


    const fs = this.fsClient();
    const collectionRef = fs
      .collection(path);

    let querier: FirebaseFirestore.Query = collectionRef;

    queryOptions.forEach(({ field, operator: { type, values } }) => {
      querier = querier.where(field, type, values);
      if (isRangeFilter(type) && !sortOptions.find(({ field: sortField }) => sortField === field)) {
        // Auto add orderBy if query is filter by range operator
        querier = querier.orderBy(field, 'asc');
      }
    })

    sortOptions.forEach(({ field, sort }) => {
      querier = querier.orderBy(field === '__id' ? admin.firestore.FieldPath.documentId() : field, sort.toLowerCase() as FirebaseFirestore.OrderByDirection);
    })

    if (sortOptions.length === 0) {
      // Default sorting by id
      querier = querier.orderBy(admin.firestore.FieldPath.documentId());
    }

    if (endBefore) {
      querier = querier.endBefore(await fs.doc(endBefore).get());
    }

    if (startAfter) {
      querier = querier.startAfter(await fs.doc(startAfter).get());
    }

    if (endAt) {
      querier = querier.endAt(await fs.doc(endAt).get());
    }

    if (startAt) {
      querier = querier.startAt(await fs.doc(startAt).get());
    }

    querier = querier.limit(DOCS_PER_PAGE);

    log.debug(JSON.stringify(querier, null, 2));

    const close = querier.onSnapshot(
      async (querySnapshot) => {
        log.verbose('Read time', querySnapshot.readTime);
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

        log.verbose(`send to ${topic} with ${docChanges.length} changes`)

        this.ctx.ipc.send(topic, {
          addedData,
          modifiedData,
          removedData,
          totalDocs: docChanges.length,
          queryVersion,
          isInitResult: querySnapshot.size === docChanges.filter(changes => changes.type === 'added').length
        }, { firestore: true });
      }, (error) => {
        log.error(error)

        this.ctx.ipc.send('error', { error: error.message });
      }
    );
    // TODO: Handle error


    const listenerData = {
      id: uuidv4(),
      topic,
      close,
    };
    this.listListeners.push(listenerData);
    log.verbose(`Create listener ${listenerData.id}`);

    return {
      id: listenerData.id,
      queryResult: {
        docsPerPage: DOCS_PER_PAGE,
        startAfter,
        endBefore,
      }
    };
  };

  public async subscribePathExplorer({ path, topic }: NSFireStore.IPathSubscribe) {
    log.verbose("received event fs.pathExplorer", { path, topic });
    // TODO: Change me to not realtime
    const close = this.fsClient()
      .collection(path !== '/' ? path : undefined)
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
      const docsTrunk = chunk(docsSnapshot, 500); // Split by 500 each chunk
      // TODO: Make it parallel. I think can not since FireStore only allow about 1k write ops /sec
      docsTrunk.forEach(async (chunk) => {
        const batch = fs.batch();
        chunk.forEach(docSnapshot => {
          batch.set(fs.doc(docSnapshot.ref.path), docSnapshot.data())
        })

        await batch.commit();
      })

      log.verbose('Transaction success!');
    } catch (e) {
      log.error('Transaction failure:', e);
      throw e;
    }

    // Send new docs to background
    // TODO: Move data_background to another function
    docsSnapshot.map(doc => {
      return fs.doc(doc.ref.path).get()
    });

    const addedData = serializeQuerySnapshot({
      docs: await Promise.all(docsSnapshot.map(doc => fs.doc(doc.ref.path).get()))
    })

    this.ctx.ipc.send('data_background', { docs: addedData, type: 'modified' }, { firestore: true });
    return true;
  };

  public async unsubscribe({ id }: NSFireStore.IListenerKey) {
    const dataSource = this.listListeners.filter((doc) => doc.id === id);
    dataSource.forEach((source) => {
      source.close();
    });

    this.listListeners = this.listListeners.filter((doc) => doc.id !== id);
    log.verbose(`Success unsubscribe this stream ${id}`);
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

    const docsTrunk = chunk(docsSnapshot, 500); // Split by 500 each chunk
    docsTrunk.forEach(async (chunk) => {
      const batch = fs.batch();
      chunk.forEach((doc) => {
        const newDocRef = fs.doc(doc.ref.path);
        batch.set(newDocRef, doc.data())
      })
  
      await batch.commit();
    });

    // Send new docs to background
    // TODO: Move data_background to another function
    docsSnapshot.map(doc => {
      return fs.doc(doc.ref.path).get()
    });

    const addedData = serializeQuerySnapshot({
      docs: await Promise.all(docsSnapshot.map(doc => fs.doc(doc.ref.path).get()))
    })

    this.ctx.ipc.send('data_background', { docs: addedData, type: 'added' }, { firestore: true });

    return true
  }

  public async deleteDocs({ docs }: NSFireStore.IRemoveDocs): Promise<boolean> {
    const fs = this.fsClient();

    const docsTrunk = chunk(docs, 500); // Split by 500 each chunk
    docsTrunk.forEach(async (chunk) => {
      const batch = fs.batch();
      chunk.forEach((path) => {
        const newDocRef = fs.doc(path);
        batch.delete(newDocRef)
      })
  
      await batch.commit();
    })
    return true;
  }

  public async deleteCollections({ collections }: NSFireStore.IRemoveCollections): Promise<boolean> {
    // TODO: Check this solution https://firebase.google.com/docs/firestore/solutions/delete-collections
    const fs = this.fsClient();

    await Promise.all(collections.map(collectionPath => {
      const collectionRef = fs.collection(collectionPath);
      const query = collectionRef.orderBy('__name__').limit(500);

      return new Promise(async (resolve, reject) => {
        this.deleteQueryBatch(query, resolve).catch(reject);
      });
    }))

    return true;
  }

  private async deleteQueryBatch(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, resolve: (value: boolean) => void) {
    const db = this.fsClient();
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve(true);
      return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      this.deleteQueryBatch(query, resolve);
    });
  }

  public async importDocs({ docs, path, option: { idField = null, autoParseJSON } }: NSFireStore.IImportDocs): Promise<boolean> {
    const fs = this.fsClient();
    const collection = fs.collection(path);

    const docsTrunk = chunk(docs, 500); // Split by 500 each chunk

    docsTrunk.forEach(async (chunk) => {
      const batch = fs.batch();
      chunk.forEach((doc) => {
        const id = idField ? get(doc, idField) : undefined;
        const newDocRef = id ? collection.doc(id) : collection.doc();
        let docData = doc;
        if (autoParseJSON) {
          Object.keys(docData).forEach(key => {
            const field = docData[key];
            try {
              docData[key] = JSON.parse(field);
            } catch (error) {
              console.warn(`Can not parse json for field ${key}. Use the original value`)
              docData[key] = field;
            }
          })
        }

        delete doc.__id__;
        delete doc.__path__;
        batch.set(newDocRef, docData)
      })
  
      await batch.commit();
    });

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
      docs: docsSnapshot.filter(doc => doc.exists)
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
    if (isCollectionPath) {
      const docsSnapshot = await fs.collection(path).get()
      return docsSnapshot.docs.map(doc => doc.ref.path);
    }

    const listCollections = await (path !== '/' ? fs.doc(path).listCollections() : fs.listCollections());
    return listCollections.map(collection => collection.path);
  }
}