import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getParentPath, newId, prettifyPath } from "@/utils/common";
import {
  deserializeDocumentSnapshotArray,
  serializeQuerySnapshot,
} from "firestore-serializers";
import firebase from "firebase/app";
import { differenceBy, uniq, uniqBy, uniqueId } from "lodash";
import {
  changedDocAtom,
  collectionAtom,
  deletedDocsAtom,
  docAtom,
  docsLibraryAtom,
  collectionHasBeenDeleteAtom,
  newDocsAtom,
  parseFSUrl,
  pathExpanderPureAtom,
} from "./firestore";
import {
  getRecoilExternalLoadable,
  IRecoilUpdateCommand,
  resetRecoilExternalState,
  setRecoilBatchUpdate,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";
import * as immutable from "object-path-immutable";
import { navigatorPathAtom, queryVersionAtom } from "./navigator";
import { actionGoTo } from "./navigator.action";
import { notifyErrorPromise } from "./ui.action";

export const actionStoreDocs = (
  {
    added = [],
    modified = [],
    removed = [],
  }: {
    added?: ClientDocumentSnapshot[];
    modified?: ClientDocumentSnapshot[];
    removed?: ClientDocumentSnapshot[];
  },
  override = false
): void => {
  const batches: any[] = [];
  added.forEach((doc) => {
    if (override) {
      batches.push({
        atom: docAtom(doc.ref.path),
        valOrUpdater: doc,
      });
    } else {
      batches.push({
        atom: docAtom(doc.ref.path),
        valOrUpdater: (curDoc) => {
          if (curDoc?.isChanged()) {
            return curDoc;
          }

          return doc;
        },
      });
    }
  });

  modified.forEach((doc) => {
    batches.push({
      atom: docAtom(doc.ref.path),
      valOrUpdater: doc,
    });
  });

  batches.push({
    // Synchronize data with docsLibraryAtom. Why I need to do it manually ?_?
    atom: docsLibraryAtom,
    valOrUpdater: (curPath) =>
      uniq([...curPath, ...[...added, ...modified].map((doc) => doc.ref.path)]),
  });

  removed.forEach((doc) => {
    console.log(doc);
    batches.push({
      atom: docAtom(doc.ref.path),
      valOrUpdater: null,
    });
  });

  batches.push({
    atom: deletedDocsAtom,
    valOrUpdater: (docs) =>
      uniqBy([...docs, ...removed], (doc) => doc.ref.path),
  });

  setRecoilBatchUpdate(batches);
};

// This is trigger from user
export const actionDeleteDoc = async (docPath: string) => {
  const doc = await getRecoilExternalLoadable(docAtom(docPath)).toPromise();
  if (doc) {
    resetRecoilExternalState(docAtom(docPath));
    if (doc.isNew) {
      // Ignore if the doc is new and haven't commit to db
      return true;
    }
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
  console.log(`start delete collection ${path}`);
  // Marks all docs as delete
  const docsInCollection = await getRecoilExternalLoadable(
    collectionAtom(path)
  ).toPromise();

  const updater: any[] = docsInCollection.map((doc) => ({
    atom: docAtom(doc.ref.path),
    valOrUpdater: null,
  }));

  updater.push({
    atom: deletedDocsAtom,
    valOrUpdater: (docs) =>
      uniqBy([...docs, ...docsInCollection], (doc) => doc.ref.path),
  });

  updater.push({
    atom: collectionHasBeenDeleteAtom,
    valOrUpdater: (paths) => uniq([...paths, path]),
  });

  requestAnimationFrame(() => {
    setRecoilBatchUpdate(updater);
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
  const allDeletedDocs = await getRecoilExternalLoadable(
    deletedDocsAtom
  ).toPromise();

  const deletedCollections = await getRecoilExternalLoadable(
    collectionHasBeenDeleteAtom
  ).toPromise();

  const deletedDocs = allDeletedDocs.filter(
    (doc) =>
      !deletedCollections.find((collection) =>
        doc.ref.path.startsWith(collection)
      )
  );

  window
    .send("fs.updateDocs", {
      docs: serializeQuerySnapshot({ docs: docsChange }),
    })
    .catch(notifyErrorPromise);

  window
    .send("fs.addDocs", {
      docs: serializeQuerySnapshot({ docs: newDocs }),
    })
    .catch(notifyErrorPromise);

  window
    .send("fs.deleteDocs", {
      docs: deletedDocs.map((doc) => doc.ref.path),
    })
    .then(() => {
      resetRecoilExternalState(deletedDocsAtom);
    })
    .catch(notifyErrorPromise);

  window
    .send("fs.deleteCollections", {
      collections: deletedCollections,
    })
    .then(() => {
      resetRecoilExternalState(collectionHasBeenDeleteAtom);
      setRecoilExternalState(pathExpanderPureAtom, (paths) =>
        paths.filter(
          (path) =>
            !deletedCollections.find((collection) =>
              path.startsWith(collection)
            )
        )
      );
    })
    .catch(notifyErrorPromise);
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
        {
          added: ClientDocumentSnapshot.transformFromFirebase(
            data,
            queryVersion
          ),
        },
        true
      );

      setRecoilExternalState(deletedDocsAtom, (docs) =>
        docs.filter((doc) => doc.ref.path !== docPath)
      );
    })
    .catch(notifyErrorPromise);
};

export const actionAddPathExpander = (paths: string[]) => {
  setRecoilExternalState(pathExpanderPureAtom, (currentValue) =>
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

interface IActionImportDocsOption {
  idField?: string;
  autoParseJSON?: boolean;
}

export const actionImportDocs = async (
  path: string,
  docs: any[],
  option: IActionImportDocsOption
) => {
  console.log({
    docs,
    path,
    option,
  });
  // TODO: Check if path is collection
  return window.send("fs.importDocs", {
    docs,
    path,
    option,
  });
};

export const actionNewDocument = async (
  collectionPath: string,
  id?: string
) => {
  // const newDocId = uniqueId(NEW_DOC_PREFIX);
  // TODO: Sort new document to the bottom of table
  const newDocId = id || newId();
  const newPath = prettifyPath(`${collectionPath}/${newDocId}`);

  const { queryVersion } = await getRecoilExternalLoadable(
    queryVersionAtom
  ).toPromise();
  setRecoilExternalState(
    docAtom(newPath),
    new ClientDocumentSnapshot({}, newDocId, newPath, queryVersion, true)
  );

  setRecoilExternalState(navigatorPathAtom, newPath);
};
