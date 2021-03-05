import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { prettifyPath } from "@/utils/common";
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
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";
import * as immutable from "object-path-immutable";

export const actionStoreDocs = (docs: ClientDocumentSnapshot[]): void => {
  docs.forEach((doc) => setRecoilExternalState(docAtom(doc.ref.path), doc));
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
      actionStoreDocs(ClientDocumentSnapshot.transformFromFirebase(data));
    });
};

export const actionAddPathExpander = (paths: string[]) => {
  setRecoilExternalState(pathExpanderAtom, (currentValue) =>
    uniq([...currentValue, ...paths.map((path) => prettifyPath(path))])
  );
};
