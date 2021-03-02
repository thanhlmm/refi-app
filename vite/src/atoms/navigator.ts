import { atom, selector, selectorFamily } from "recoil";
import * as immutable from "object-path-immutable";
import { collectionAtom } from "./firestore";
import { getAllColumns, getParentPath, isCollection } from "@/utils/common";
import produce from "immer";

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

export const filtersOptions = [
  {
    value: "eq",
    label: "==",
  },
  {
    value: "lt",
    label: "<",
  },
  {
    value: "lte",
    label: "<=",
  },
  {
    value: "gt",
    label: ">",
  },
  {
    value: "gte",
    label: ">=",
  },
  {
    value: "ne",
    label: "!=",
  },
  {
    value: "contains",
    label: "in",
  },
  {
    value: "in",
    label: "not in",
  },
  {
    value: "array-contains-any",
    label: "arrays contains any",
  },
];

interface IOperator {
  type: string;
  values: any;
}
interface IOperatorCommons extends IOperator {
  type: "eq" | "lt" | "lte" | "gt" | "gte" | "ne";
  values: string | number | boolean | Date;
}

interface IOperatorNotEqual extends IOperator {
  type: "array-contains";
  values: string | number | boolean | Date;
}

interface IOperatorInList extends IOperator {
  type: "in" | "not-in" | "array-contains-any";
  values: any[];
}

interface IQueryEntity {
  id: string;
  field: string;
  operator: IOperatorCommons | IOperatorNotEqual | IOperatorInList;
}

export const querierAtom = atom<IQueryEntity[]>({
  key: "fs.querier",
  default: [],
});

export const querierOptionAtom = selectorFamily<
  IQueryEntity | undefined,
  string
>({
  key: "fs.querierOption",
  get: (id) => ({ get }) => {
    return get(querierAtom).find((query) => query.id === id);
  },
  set: (id) => ({ get, set }, newValue) => {
    const optionIndex = get(querierAtom).findIndex((query) => query.id === id);
    if (optionIndex >= 0) {
      set(
        querierAtom,
        produce((querier) => {
          querier[optionIndex] = newValue;
        })
      );
    }
  },
});

export const allColumns = selector<string[]>({
  key: "fs.allColumns",
  get: ({ get }) => {
    const currentPath = get(navigatorPathAtom);
    const collections = get(collectionAtom(currentPath));

    return getAllColumns(collections);
  },
});
