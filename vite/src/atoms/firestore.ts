import { NSFireStore } from "@/types/FS";
import { atomFamily, selectorFamily } from "recoil";
import * as immutable from "object-path-immutable";
import { DocSnapshot } from "@/types/DocSnapshot";

type IFirestorePath = string;
interface IPathDetail {
  path: string;
  field: string;
}

export const buildFSUrl = ({ path, field }: IPathDetail): IFirestorePath => {
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

export const getParentPath = (url: string) => {
  const entities = url.split("/");
  // TODO: Handle it at root
  entities.pop() || entities.pop();

  return entities.join("/");
};

export const collectionAtom = atomFamily<
  NSFireStore.IDocSnapshot[],
  IFirestorePath
>({
  key: "FireStore_collection",
  default: [],
});

export const docAtom = atomFamily<
  NSFireStore.IDocSnapshot | null,
  IFirestorePath
>({
  key: "FireStore_doc",
  default: selectorFamily({
    key: "FireStore_doc_parent",
    get: (path) => ({ get }) => {
      // TODO: Validate if path is null?
      const docs = get(collectionAtom(getParentPath(path)));

      console.log({ path: getParentPath(path), docs });

      return docs.find((doc) => doc.ref.path === path) || null;
    },
  }),
});

export const fieldAtom = selectorFamily<any, string>({
  key: "FireStore_doc_field",
  get: (url) => ({ get }) => {
    const { path, field } = parseFSUrl(url);
    const doc = get(docAtom(path));
    console.log({ url, doc });

    if (doc) {
      return doc.data()[field];
    }

    return undefined;
  },
  set: (url) => ({ set, get }, newValue) => {
    const { path, field } = parseFSUrl(url);
    const doc = get(docAtom(path));
    if (doc) {
      const newDoc = new DocSnapshot(
        immutable.set(doc.data(), field, newValue),
        doc.id,
        path
      );

      console.log({ newDoc });

      newDoc.addChange(field);
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
