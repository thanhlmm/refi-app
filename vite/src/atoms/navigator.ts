import { atom, atomFamily, selector, selectorFamily } from "recoil";
import { collectionAtom } from "./firestore";
import {
  getAllColumns,
  getAllColumnsRecursive,
  getCollectionPath,
  getParentPath,
  getSampleColumn,
  isCollection,
} from "@/utils/common";
import produce from "immer";
import persistAtom from "./persistAtom";
import {
  getRecoilExternalLoadable,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";

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
    return getCollectionPath(path);
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

type IOperatorValue = string | number | boolean;
export interface INormalOperator {
  type: "<" | "<=" | "==" | "!=" | ">=" | ">" | "array-contains";
  values: IOperatorValue;
}

export interface IArrayOperator {
  type: "in" | "not-in" | "array-contains-any";
  values: IOperatorValue[];
}

interface IQueryEntity {
  id: string;
  field: string;
  operator: INormalOperator | IArrayOperator;
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
  sort: "asc" | "desc";
}

export const sorterAtom = atomFamily<ISorterEntity[], string>({
  key: "fs.sorter",
  default: () => [],
  // effects_UNSTABLE: [persistAtom],
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

export interface IQueryVersion {
  queryVersion: number;
  withQuerier: boolean;
  startAfter?: string;
  endBefore?: string;
  startAt?: string;
  endAt?: string;
  collectionPath: string;
}

export const queryHistory: IQueryVersion[] = [];

export const queryVersionAtom = atom<IQueryVersion>({
  key: "navigator.queryVersion",
  default: {
    collectionPath: "/",
    queryVersion: 0,
    withQuerier: true,
  },
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((newDoc) => {
        queryHistory.push(newDoc as any);
      });
    },
  ],
});

export interface IQueryResult {
  start?: string;
  end?: string;
  collectionPath: string;
}

export const queryResultAtom = atomFamily<IQueryResult, number>({
  key: "navigator.queryResultNavigator",
  default: selectorFamily({
    key: "navigator.queryResultNavigatorSelector",
    get: () => ({ get }) => ({
      collectionPath: get(navigatorCollectionPathAtom),
    }),
  }),
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

export const propertyListCoreAtom = atomFamily<string[] | null, string>({
  key: "fs/propertyList",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const propertyListAtom = selectorFamily<string[], string>({
  key: "fs/propertyList",
  get: (path) => ({ get }) => get(propertyListCoreAtom(path)) || [],
  set: (path) => ({ set }, newValue) =>
    set(propertyListCoreAtom(path), newValue),
});
