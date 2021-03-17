import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { collectionAtom } from "./firestore";
import {
  getAllColumns,
  getAllColumnsRecursive,
  getParentPath,
  getSampleColumn,
  isCollection,
} from "@/utils/common";
import produce from "immer";
import persistAtom from "./persistAtom";

export const FIELD_TYPES: RefiFS.IFieldType[] = [
  "string",
  "number",
  "boolean",
  "map",
  "array",
  "null",
  "timestamp",
  "geopoint",
  "reference",
];

// TODO: Check if the path exist
export const navigatorPathAtom = atom<string>({
  key: "navigator.path",
  default: "/",
});

export const navigatorCollectionPathAtom = selector<string>({
  key: "navigator.collectionPath",
  get: ({ get }) => {
    const path = get(navigatorPathAtom);
    const isCollectionType = isCollection(path);
    return isCollectionType ? path : getParentPath(path);
  },
});

export type WhereFilterOp =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "in"
  | "not-in"
  | "array-contains-any";

interface IOperator {
  type: WhereFilterOp;
  values: any;
}

interface IQueryEntity {
  id: string;
  field: string;
  operator: IOperator;
  isActive: boolean;
}

export const querierAtom = atomFamily<IQueryEntity[], string>({
  key: "fs.querier",
  default: () => [],
  effects_UNSTABLE: [persistAtom],
});

export const querierOptionAtom = selectorFamily<
  IQueryEntity | undefined,
  { id: string; path: string }
>({
  key: "fs.querierOption",
  get: ({ id, path }) => ({ get }) => {
    return get(querierAtom(path)).find((query) => query.id === id);
  },
  set: ({ id, path }) => ({ get, set }, newValue) => {
    const optionIndex = get(querierAtom(path)).findIndex(
      (query) => query.id === id
    );
    if (optionIndex >= 0) {
      set(
        querierAtom(path),
        produce((querier) => {
          querier[optionIndex] = newValue;
        })
      );
    }
  },
});

export interface ISorterEntity {
  id: string;
  field: string;
  sort: "ASC" | "DESC";
}

export const sorterAtom = atomFamily<ISorterEntity[], string>({
  key: "fs.sorter",
  default: () => [],
  effects_UNSTABLE: [persistAtom],
});

export const sorterItemAtom = selectorFamily<
  ISorterEntity | undefined,
  { id: string; path: string }
>({
  key: "fs.sorterItem",
  get: ({ id, path }) => ({ get }) => {
    return get(sorterAtom(path)).find((query) => query.id === id);
  },
  set: ({ id, path }) => ({ get, set }, newValue) => {
    const optionIndex = get(sorterAtom(path)).findIndex(
      (query) => query.id === id
    );
    if (optionIndex >= 0) {
      set(
        sorterAtom(path),
        produce((sorter) => {
          sorter[optionIndex] = newValue;
        })
      );
    }
  },
});

export const queryVersionAtom = atom<{
  queryVersion: number;
  withQuerier: boolean;
}>({
  key: "navigator.queryVersion",
  default: {
    queryVersion: 0,
    withQuerier: true,
  },
});

export const allColumnsAtom = selector<string[]>({
  key: "fs.allColumns",
  get: ({ get }) => {
    const collectionPath = get(navigatorCollectionPathAtom);
    const collections = get(collectionAtom(collectionPath));

    return getAllColumns(collections);
  },
});

export const allColumnsRecursiveAtom = selector<string[]>({
  key: "fs.allColumnsRecursive",
  get: ({ get }) => {
    const collectionPath = get(navigatorCollectionPathAtom);
    const collections = get(collectionAtom(collectionPath));

    return getAllColumnsRecursive(collections);
  },
});

export const propertyListAtom = atomFamily<string[], string>({
  key: "fs/propertyList",
  default: selectorFamily({
    key: "fs/propertyList:selector",
    get: (path) => ({ get }) => {
      const collectionDocs = get(collectionAtom(path));
      // TODO: Check why it run again when this atom is already existed

      return getSampleColumn(collectionDocs);
    },
  }),
  effects_UNSTABLE: [persistAtom],
});
