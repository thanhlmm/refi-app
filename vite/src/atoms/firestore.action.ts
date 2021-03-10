import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getParentPath, prettifyPath } from "@/utils/common";
import {
  serializeQuerySnapshot,
  deserializeDocumentSnapshotArray,
} from "firestore-serializers";
import firebase from "firestore-serializers/node_modules/firebase";
import { uniq } from "lodash";
import {
  changedDocAtom,
  docAtom,
  parseFSUrl,
  pathExpanderAtom,
} from "./firestore";
import {
  getRecoilExternalLoadable,
  resetRecoilExternalState,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";
import * as immutable from "object-path-immutable";

export const actionStoreDocs = (
  docs: ClientDocumentSnapshot[],
  override = false
): void => {
  docs.forEach(async (doc) => {
    const originalDoc = await getRecoilExternalLoadable(
      docAtom(doc.ref.path)
    ).toPromise();
    if (!override && originalDoc && originalDoc.isChanged()) {
      // In-case user has modify the original docs
      // NOTICE: We just ignore new update if we're currently edit an document
      // originalDoc.mergeNewDoc(doc);
    } else {
      setRecoilExternalState(docAtom(doc.ref.path), doc);
    }
  });
};

export const actionRemoveDocs = (
  docs: ClientDocumentSnapshot[],
  override = false
): void => {
  docs.forEach(async (doc) => {
    if (override) {
      // TODO: What if user already modified the deleted one
    } else {
      resetRecoilExternalState(docAtom(doc.ref.path));
    }
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

    const newDoc = new ClientDocumentSnapshot(newData.value(), doc.id, path);
    newDoc.addChange([...doc.changedFields(), oldField, newField]);
    setRecoilExternalState(docAtom(path), newDoc);
  }
};

export const actionRemoveFieldKey = async (oldPath: string): Promise<void> => {
  const { path, field: oldField } = parseFSUrl(oldPath);
  const curDocAtom = docAtom(path);
  const doc = await getRecoilExternalLoadable(curDocAtom).toPromise();
  if (doc) {
    const docData = immutable.wrap(doc.data());
    const newData = docData.del(oldField);

    const newDoc = new ClientDocumentSnapshot(newData.value(), doc.id, path);
    newDoc.addChange([...doc.changedFields(), oldField]);
    setRecoilExternalState(docAtom(path), newDoc);
  }
};

export const actionCommitChange = async (): Promise<any> => {
  const docsChange = await getRecoilExternalLoadable(
    changedDocAtom
  ).toPromise();

  return window
    .send("fs.updateDocs", {
      docs: serializeQuerySnapshot({ docs: docsChange }),
    })
    .then((a) => console.log(a));
};

export const actionReverseChange = async (): Promise<any> => {
  const docsChange = await getRecoilExternalLoadable(
    changedDocAtom
  ).toPromise();

  return window
    .send("fs.getDocs", {
      docs: docsChange.map((doc) => doc.ref.path),
    })
    .then((response) => {
      const data = deserializeDocumentSnapshotArray(
        response,
        firebase.firestore.GeoPoint,
        firebase.firestore.Timestamp
      );

      actionStoreDocs(ClientDocumentSnapshot.transformFromFirebase(data), true);
    });
};

export const actionAddPathExpander = (paths: string[]) => {
  setRecoilExternalState(pathExpanderAtom, (currentValue) =>
    uniq([...currentValue, ...paths.map((path) => prettifyPath(path))])
  );
};

export const duplicateDoc = async (path: string) => {
  const doc = await getRecoilExternalLoadable(docAtom(path)).toPromise();

  if (!doc) {
    // TODO: Throw error here
    return;
  }

  return window
    .send("fs.addDoc", {
      doc: doc.data(),
      path: getParentPath(doc.ref.path),
    })
    .then((a) => console.log(a));
};
