import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getParentPath, newId, prettifyPath } from "@/utils/common";
import {
  deserializeDocumentSnapshotArray,
  serializeQuerySnapshot,
} from "firestore-serializers";
import firebase from "firebase";
import { differenceBy, uniq, uniqBy, uniqueId } from "lodash";
import {
  changedDocAtom,
  collectionAtom,
  deletedDocsAtom,
  docAtom,
  docsLibraryAtom,
  hasBeenDeleteAtom,
  newDocsAtom,
  parseFSUrl,
  pathExpanderAtom,
} from "./firestore";
import {
  getRecoilExternalLoadable,
  resetRecoilExternalState,
  setRecoilBatchUpdate,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";
import * as immutable from "object-path-immutable";
import { navigatorPathAtom, queryVersionAtom } from "./navigator";
import { actionGoTo } from "./navigator.action";

export const actionStoreDocs = (
  docs: ClientDocumentSnapshot[],
  override = false
): void => {
  setRecoilBatchUpdate([
    ...docs.map((doc) => ({ atom: docAtom(doc.ref.path), valOrUpdater: doc })),
    {
      // Synchronize data with docsLibraryAtom
      atom: docsLibraryAtom,
      valOrUpdater: (curPath) =>
        uniq([...curPath, ...docs.map((doc) => doc.ref.path)]),
    },
  ]);
  // docs.forEach(async (doc) => {
  //   // const originalDoc = await getRecoilExternalLoadable(
  //   //   docAtom(doc.ref.path)
  //   // ).toPromise();
  //   // In-case user has modify the original docs
  //   // NOTICE: We just ignore new update if we're currently edit an document
  //   // originalDoc.mergeNewDoc(doc);
  //   setTimeout(() => {
  //     // To make not let the UI locking
  //     setRecoilExternalState(docAtom(doc.ref.path), doc);
  //   }, 0);
  // });
};

// This is trigger from user
export const actionDeleteDoc = async (docPath: string) => {
  const doc = await getRecoilExternalLoadable(docAtom(docPath)).toPromise();
  if (doc) {
    resetRecoilExternalState(docAtom(docPath));
    setRecoilExternalState(deletedDocsAtom, (docs) =>
      uniqBy([...docs, doc], (doc) => doc.ref.path)
    );
  }

  return true;
};

// This is trigger from server. It will irevertable
export const actionRemoveDocs = (
  docs: ClientDocumentSnapshot[],
  override = false
): void => {
  docs.forEach(async (doc) => {
    // TODO: What if user already modified the deleted one
    resetRecoilExternalState(docAtom(doc.ref.path));
    setRecoilExternalState(deletedDocsAtom, (deletedDocs) =>
      differenceBy(deletedDocs, docs, (doc) => doc.ref.path)
    );
  });
};

// This is trigger from user
export const actionDeleteCollection = async (path: string): Promise<void> => {
  setRecoilExternalState(hasBeenDeleteAtom(path), true);
  // Marks all docs as delete
  const docsInCollection = await getRecoilExternalLoadable(
    collectionAtom(path)
  ).toPromise();
  docsInCollection.forEach((doc) => {
    actionDeleteDoc(doc.ref.path);
  });
};

export const actionUpdateDoc = (doc: ClientDocumentSnapshot): void => {
  setRecoilExternalState(docAtom(doc.ref.path), doc);
};

export const actionUpdateFieldKey = async (
  oldPath: string,
  newField: string
): Promise<void> => {
  const { path, field: oldField } = parseFSUrl(oldPath);
  const curDocAtom = docAtom(path);
  const doc = await getRecoilExternalLoadable(curDocAtom).toPromise();
  if (doc) {
    const docData = immutable.wrap(doc.data());
    const oldFieldData = immutable.get(doc.data(), oldField);
    const newData = docData.del(oldField).set(newField, oldFieldData);

    const newDoc = doc.clone(newData.value());
    newDoc.addChange([oldField, newField]);
    setRecoilExternalState(docAtom(path), newDoc);
  }
};

export const actionRemoveFieldKey = async (oldPath: string): Promise<void> => {
  const { path, field: oldField } = parseFSUrl(oldPath);
  const curDocAtom = docAtom(path);
  const doc = await getRecoilExternalLoadable(curDocAtom).toPromise();
  if (doc) {
    const newDoc = doc.clone().removeField(oldField);
    setRecoilExternalState(docAtom(path), newDoc);
  }
};

export const actionCommitChange = async (): Promise<boolean> => {
  const docsChange = await getRecoilExternalLoadable(
    changedDocAtom
  ).toPromise();

  const newDocs = await getRecoilExternalLoadable(newDocsAtom).toPromise();
  const deletedDocs = await getRecoilExternalLoadable(
    deletedDocsAtom
  ).toPromise();

  window
    .send("fs.updateDocs", {
      docs: serializeQuerySnapshot({ docs: docsChange }),
    })
    .then((a) => console.log(a));

  window
    .send("fs.addDocs", {
      docs: serializeQuerySnapshot({ docs: newDocs }),
    })
    .then((a) => console.log(a));

  window
    .send("fs.deleteDocs", {
      docs: deletedDocs.map((doc) => doc.ref.path),
    })
    .then(() => {
      resetRecoilExternalState(deletedDocsAtom);
    });
  return true;
};

export const actionReverseChange = async (): Promise<any> => {
  // TODO: Confirm box to reload
  window.location.reload();
  // const docsChange = await getRecoilExternalLoadable(
  //   changedDocAtom
  // ).toPromise();

  // return window
  //   .send("fs.getDocs", {
  //     docs: docsChange.map((doc) => doc.ref.path),
  //   })
  //   .then((response) => {
  //     const data = deserializeDocumentSnapshotArray(
  //       response,
  //       firebase.firestore.GeoPoint,
  //       firebase.firestore.Timestamp
  //     );

  //     actionStoreDocs(ClientDocumentSnapshot.transformFromFirebase(data), true);
  //   });
};

export const actionReverseDocChange = async (
  docPath: string,
  type: "new" | "modified" | "deleted"
): Promise<any> => {
  const { queryVersion } = await getRecoilExternalLoadable(
    queryVersionAtom
  ).toPromise();
  // TODO: Do we really need to fetch the data again?

  if (type === "new") {
    resetRecoilExternalState(docAtom(docPath));
    return;
  }

  return window
    .send("fs.getDocs", {
      docs: [docPath],
    })
    .then((response) => {
      const data = deserializeDocumentSnapshotArray(
        response,
        firebase.firestore.GeoPoint,
        firebase.firestore.Timestamp
      );

      actionStoreDocs(
        ClientDocumentSnapshot.transformFromFirebase(data, queryVersion),
        true
      );

      setRecoilExternalState(deletedDocsAtom, (docs) =>
        docs.filter((doc) => doc.ref.path !== docPath)
      );
    });
};

export const actionAddPathExpander = (paths: string[]) => {
  setRecoilExternalState(pathExpanderAtom, (currentValue) =>
    uniq([...currentValue, ...paths.map((path) => prettifyPath(path))])
  );
};

export const actionDuplicateDoc = async (path: string) => {
  const doc = await getRecoilExternalLoadable(docAtom(path)).toPromise();

  if (!doc) {
    // TODO: Throw error here
    return;
  }

  const newDocId = newId();
  const newDoc = doc.clone(doc.data(), newDocId);
  setRecoilExternalState(docAtom(newDoc.ref.path), newDoc);
  actionGoTo(newDoc.ref.path);
};

export const actionImportDocs = async (path: string, docs: any[]) => {
  // TODO: Check if path is collection
  return window
    .send("fs.importDocs", {
      docs,
      path,
    })
    .then((a) => console.log(a));
};

export const actionNewDocument = async (path) => {
  // const newDocId = uniqueId(NEW_DOC_PREFIX);
  // TODO: Sort new document to the bottom of table
  const newDocId = newId();
  const newPath = `${path}/${newDocId}`;

  const { queryVersion } = await getRecoilExternalLoadable(
    queryVersionAtom
  ).toPromise();
  setRecoilExternalState(
    docAtom(newPath),
    new ClientDocumentSnapshot({}, newDocId, newPath, queryVersion, true)
  );

  setRecoilExternalState(navigatorPathAtom, newPath);
};
