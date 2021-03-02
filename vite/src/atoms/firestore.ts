import { atomFamily, selectorFamily, atom, selector } from "recoil";
import * as immutable from "object-path-immutable";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import {
  getRecoilExternalLoadable,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";
import { getParentPath, prettifyPath } from "@/utils/common";
import {
  deserializeDocumentSnapshotArray,
  serializeQuerySnapshot,
} from "firestore-serializers";
import { useCallback } from "react";
import firebase from "firebase";
import "firebase/firestore";
import { uniq } from "lodash";

type IFireStorePath = string;
interface IPathDetail {
  path: string;
  field: string;
}

export const buildFSUrl = ({ path, field }: IPathDetail): IFireStorePath => {
  return `${path}:${field}`;
};

export const parseFSUrl = (url: string): IPathDetail => {
  // Path convention: {path}:{fieldName}
  const [path, field] = url.split(":");
  return {
    path,
    field,
  };
};

export const docsLibraryAtom = atom<IFireStorePath[]>({
  key: "FireStore_docs_library",
  default: [],
  // TODO: Clean up function for this library
});

export const docAtom = atomFamily<
  ClientDocumentSnapshot | null,
  IFireStorePath
>({
  key: "FireStore_doc",
  default: null,
  effects_UNSTABLE: () => [
    ({ onSet }) => {
      // Synchronize data with docsLibraryAtom
      onSet((newDoc) => {
        if (newDoc instanceof ClientDocumentSnapshot) {
          setRecoilExternalState(docsLibraryAtom, (currVal) => {
            if (!currVal.includes(newDoc.ref.path)) {
              return [...currVal, newDoc.ref.path];
            }

            return currVal;
          });
        }
      });
    },
  ],
});

export const storeDocs = (docs: ClientDocumentSnapshot[]): void => {
  docs.forEach((doc) => setRecoilExternalState(docAtom(doc.ref.path), doc));
};

export const collectionAtom = selectorFamily<
  ClientDocumentSnapshot[],
  IFireStorePath
>({
  key: "FireStore_collection",
  get: (path) => ({ get }) => {
    const docsLibrary = get(docsLibraryAtom);
    return docsLibrary
      .filter((docPath) => getParentPath(docPath) === path)
      .map((docPath) => get(docAtom(docPath)))
      .filter(
        (docValue): docValue is ClientDocumentSnapshot => docValue !== null
      );
  },
});

export const allDocsAtom = selector<ClientDocumentSnapshot[]>({
  key: "FireStore_all_docs",
  get: ({ get }) => {
    const docsLibrary = get(docsLibraryAtom);
    return docsLibrary
      .map((docPath) => get(docAtom(docPath)))
      .filter(
        (docValue): docValue is ClientDocumentSnapshot => docValue !== null
      );
  },
});

export const fieldAtom = selectorFamily<unknown, string>({
  key: "FireStore_doc_field",
  get: (url) => ({ get }) => {
    const { path, field } = parseFSUrl(url);
    const doc = get(docAtom(path));

    if (doc) {
      return immutable.get(doc.data(), field);
    }

    return undefined;
  },
  set: (url) => ({ set, get }, newValue) => {
    const { path, field } = parseFSUrl(url);
    const doc = get(docAtom(path));
    if (doc) {
      const newDoc = new ClientDocumentSnapshot(
        immutable.set(doc.data(), field, newValue),
        doc.id,
        path
      );
      newDoc.addChange([...doc.changedFields(), field]);
      set(docAtom(path), newDoc);
    }
  },
});

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

export const fieldChangedAtom = selectorFamily<boolean, string>({
  key: "FireStore_doc_field",
  get: (url) => ({ get }) => {
    const { path, field } = parseFSUrl(url);
    const doc = get(docAtom(path));

    if (doc) {
      return doc.changedFields().includes(field);
    }

    return false;
  },
});

export const changedDocAtom = selector<ClientDocumentSnapshot[]>({
  key: "FireStore_docs_changed",
  get: ({ get }) => {
    const docs = get(docsLibraryAtom);

    return docs
      .map((docPath) => get(docAtom(docPath)))
      .filter(
        (docValue): docValue is ClientDocumentSnapshot => docValue !== null
      )
      .filter((doc) => doc.isChanged());
  },
});

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

export const useActionCommitChange = (deps: React.DependencyList = []) =>
  useCallback(() => {
    actionCommitChange();
  }, [deps]);

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
      storeDocs(ClientDocumentSnapshot.transformFromFirebase(data));
    });
};

export const useActionReverseChange = (deps: React.DependencyList = []) =>
  useCallback(() => {
    actionReverseChange();
  }, [deps]);

export const pathExpanderAtom = atom<string[]>({
  key: "FireStore_path_expander",
  default: [],
});

export const actionAddPathExpander = (paths: string[]) => {
  setRecoilExternalState(pathExpanderAtom, (currentValue) =>
    uniq([...currentValue, ...paths.map((path) => prettifyPath(path))])
  );
};
