import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getParentPath } from "@/utils/common";
import "firebase/firestore";
import * as immutable from "object-path-immutable";
import { atom, atomFamily, selector, selectorFamily } from "recoil";
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

export const pathExpanderAtom = atom<string[]>({
  key: "FireStore_path_expander",
  default: [],
});
