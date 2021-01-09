async function convertDocumentRef(docRef) {
  const docCollections = await docRef.listCollections();

  return {
    ...docRef,
    _collections: docCollections,
  };
}

function convertSnapshotToDoc(snapshot) {
  return {
    ...snapshot.data(),
    _ref: {
      id: snapshot.ref.id,
      path: snapshot.ref.path,
    },
  };
}

module.exports = {
  convertDocumentRef,
  convertSnapshotToDoc,
};
