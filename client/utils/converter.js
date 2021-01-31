const _pickBy = require("lodash/pickBy");
const _omit = require("lodash/omit");
const _mapValues = require("lodash/mapValues");

async function convertDocumentRef(docRef) {
  const docCollections = await docRef.listCollections();

  return {
    ...docRef,
    _collections: docCollections,
  };
}

function getDocMetaData(snapshot) {
  const objData = snapshot.data();
  if (typeof objData === undefined) {
    return objData;
  }

  const docTypes = Object.keys(objData).reduce(
    (prev, key) => ({
      ...prev,
      [key]: objData?.[key]?.constructor?.name || "Object",
    }),
    {}
  );

  return {
    ref: {
      id: snapshot.ref.id,
      path: snapshot.ref.path,
    },
    time: {
      createTime: snapshot.createTime,
      updateTime: snapshot.updateTime,
      readTime: snapshot.readTime,
    },
    type: docTypes,
  };
}

function convertSnapshotToDoc(snapshot) {
  const objData = snapshot.data();
  if (typeof objData === undefined) {
    return objData;
  }

  const docTypes = Object.keys(objData).reduce(
    (prev, key) => ({
      ...prev,
      [key]: objData?.[key]?.constructor?.name || "Object",
    }),
    {}
  );

  const refFields = _pickBy(
    objData,
    (value, key) => docTypes?.[key] === "DocumentReference"
  );
  console.log(refFields);
  const resFieldsValue = _mapValues(refFields, (value) => value.path);

  return {
    ...objData,
    ...resFieldsValue,
    __METADATA: {
      ref: {
        id: snapshot.ref.id,
        path: snapshot.ref.path,
      },
      time: {
        createTime: snapshot.createTime,
        updateTime: snapshot.updateTime,
        readTime: snapshot.readTime,
      },
      type: docTypes,
    },
  };
}

const postConverter = {
  toFirestore(doc) {
    return _omit(doc, ["__METADATA"]);
  },
  fromFirestore(snapshot) {
    return convertSnapshotToDoc(snapshot);
  },
};

module.exports = {
  convertDocumentRef,
  convertSnapshotToDoc,
  postConverter,
  getDocMetaData,
};
