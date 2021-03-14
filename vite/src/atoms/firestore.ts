import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getParentPath } from "@/utils/common";
import "firebase/firestore";
import { difference, isObject } from "lodash";
import * as immutable from "object-path-immutable";
import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { queryVersionAtom } from "./navigator";
import { setRecoilExternalState } from "./RecoilExternalStatePortal";

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

export const projectIdAtom = atom<string>({
  key: "FireStore_project_id",
  default: "",
});

export const deletedDocsAtom = atom<IFireStorePath[]>({
  key: "FireStore_docs_deleted",
  default: [],
});

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
        // TODO: Sync the case doc is deleted
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

export const collectionWithQueryAtom = selectorFamily<
  ClientDocumentSnapshot[],
  IFireStorePath
>({
  key: "FireStore_collection",
  get: (path) => ({ get }) => {
    const docsLibrary = get(docsLibraryAtom);
    const { queryVersion } = get(queryVersionAtom);
    return docsLibrary
      .filter((docPath) => getParentPath(docPath) === path)
      .map((docPath) => get(docAtom(docPath)))
      .filter(
        (docValue): docValue is ClientDocumentSnapshot => docValue !== null
      )
      .filter((docValue) => docValue.queryVersion === queryVersion)
      .sort((a, b) => a.id.localeCompare(b.id));
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

export const fieldAtom = selectorFamily<any, string>({
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
    // TODO: Use immer to store field patch
    const { path, field } = parseFSUrl(url);
    const doc = get(docAtom(path));
    if (doc) {
      const newDoc = doc.clone().setField(field, newValue);
      const oldValue = immutable.get(doc.data(), field);
      if (isObject(oldValue) && isObject(oldValue)) {
        // Add changes if the object inside changed
        newDoc.addChange(
          difference(Object.keys(newValue), Object.keys(oldValue)).map(
            (key) => `${field}.${key}`
          )
        );
      }
      set(docAtom(path), newDoc);
    }
  },
});

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

export const newDocsAtom = selector<ClientDocumentSnapshot[]>({
  key: "FireStore_docs_new",
  get: ({ get }) => {
    const docs = get(docsLibraryAtom);

    return docs
      .map((docPath) => get(docAtom(docPath)))
      .filter(
        (docValue): docValue is ClientDocumentSnapshot => docValue !== null
      )
      .filter((doc) => doc.isNew);
  },
});

export const hasNewDocAtom = selectorFamily<boolean, string>({
  key: "FireStore_collection_new",
  get: (path) => ({ get }) => {
    const newDocs = get(newDocsAtom);

    for (let i = 0; i < newDocs.length; i++) {
      const doc = newDocs[i];
      if (doc.ref.path.startsWith(path)) {
        return true;
      }
    }

    return false;
  },
});

export const hasBeenDeleteAtom = atomFamily<boolean, string>({
  key: "FireStore_collection_deleted",
  default: false,
});

export const pathExpanderAtom = atom<string[]>({
  key: "FireStore_path_expander",
  default: [],
});
