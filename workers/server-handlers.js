const fsClient = require("./firebaseClient");
const uuid = require("uuid");
const { send } = require("./server-ipc");
const { convertSnapshotToDoc } = require("../utils/converter");

// QueryOptions
// collectionId
// converter: {}
// fieldFilters: []
// fieldOrder: []
// parentPath: {[]}

let handlers = {};

let listListeners = []; // ID in here MUST unique

handlers._history = [];

handlers["make-factorial"] = async ({ num }) => {
  handlers._history.push(num);

  function fact(n) {
    if (n === 1) {
      return 1;
    }
    return n * fact(n - 1);
  }

  console.log("making factorial");
  return fact(num);
};

handlers["ring-ring"] = async () => {
  console.log("picking up the phone");
  return "hello!";
};

handlers["fs-ping"] = async () => {
  const data = await fsClient.collection("users").get();
  console.log(data);
  return data;
};

handlers["fs.queryDoc.subscribe"] = async ({ path, topic }) => {
  console.log("received event fs.query.subscribe", { path, topic });
  const close = fsClient.doc(path).onSnapshot(
    async function (doc) {
      send(topic, convertSnapshotToDoc(doc));

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

handlers["fs.queryCollection.subscribe"] = async ({ path, topic }) => {
  console.log("received event fs.query.subscribe", { path, topic });
  const close = fsClient.collection(path).onSnapshot(
    async function (querySnapshot) {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(convertSnapshotToDoc(doc));
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

handlers["fs.unsubscribe"] = async ({ id }) => {
  const dataSource = listListeners.find((doc) => doc.id === id);
  if (dataSource) {
    dataSource.close();
    listListeners = listListeners.filter((doc) => doc.id !== id);
    console.log("Success unsubscribe this stream");
  }
};

module.exports = handlers;
