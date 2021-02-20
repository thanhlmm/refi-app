import fsClient from './firebaseClient';
const uuid = require("uuid");
const { send } = require("./server-ipc");
const admin = require("firebase-admin");
const { getDocMetaData, postConverter } = require("../utils/converter");

// QueryOptions
// collectionId
// converter: {}
// fieldFilters: []
// fieldOrder: []
// parentPath: {[]}

let handlers: Record<string, Function> = {};

let listListeners: FireService.IListenerEntity[] = []; // ID in here MUST unique

handlers["fs.init"] = async (file: any) => {
  console.log(file);
  // const app = admin.initializeApp({
  //   credential: admin.credential.cert({
  //     projectId: credentials.project_id,
  //     clientEmail: credentials.client_email,
  //     privateKey: credentials.private_key,
  //   }),
  // });
}

handlers["fs.queryDoc.subscribe"] = async ({ path, topic }: FireService.IDocSubscribe) => {
  console.log("received event fs.query.subscribe", { path, topic });
  const close = fsClient
    .doc(path)
    .withConverter(postConverter)
    .onSnapshot(
      async function (doc) {
        send(topic, doc.data());

        const collections = await doc.ref.listCollections();
        send(
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
  listListeners.push(listenerData);

  return { id: listenerData.id };
};

handlers["fs.queryCollection.subscribe"] = async ({ path, topic }: FireService.ICollectionSubscribe) => {
  console.log("received event fs.query.subscribe", { path, topic });
  const close = fsClient
    .collection(path)
    .withConverter(postConverter)
    .onSnapshot(
      async function (querySnapshot) {
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });

        send(topic, data);
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
  listListeners.push(listenerData);

  return { id: listenerData.id };
};

handlers["fs.pathExplorer.subscribe"] = async function ({ path, topic }: FireService.IPathSubscribe) {
  console.log("received event fs.pathExplorer", { path, topic });
  const close = fsClient
    .collection(path)
    .withConverter(postConverter)
    .onSnapshot(
      async function (querySnapshot) {
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push(getDocMetaData(doc));
        });

        send(topic, data);
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
  listListeners.push(listenerData);

  return { id: listenerData.id };
};

handlers["fs.unsubscribe"] = async ({ id }: FireService.IUnsubscribe) => {
  const dataSource = listListeners.filter((doc) => doc.id === id);
  dataSource.forEach((source) => {
    source.close();
  });
  listListeners = listListeners.filter((doc) => doc.id !== id);
  console.log("Success unsubscribe this stream");
};

export default handlers;
