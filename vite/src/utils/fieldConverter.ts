import dayjs from "dayjs";
import { DocRef } from "firestore-serializers/src/DocRef";
import { getFireStoreType } from "./simplifr";
import firebase from "firebase";
import { isNumeric } from "@/utils/common";

export const fieldConverter: Record<
  RefiFS.IFieldType,
  (toType: RefiFS.IFieldType, value: any) => any
> = {
  string: (toType: RefiFS.IFieldType, value: string) => {
    switch (toType) {
      case "number":
        return isNumeric(value) ? Number(value) : 0;
      case "boolean":
        return Boolean(["yes", "true"].includes(value?.toLowerCase()));

      case "map":
        try {
          return JSON.parse(value);
        } catch (error) {
          return {};
        }

      case "timestamp":
        // Try to parse
        try {
          return firebase.firestore.Timestamp.fromDate(dayjs(value).toDate());
        } catch (error) {
          console.log(error);
          return firebase.firestore.Timestamp.fromDate(new Date());
        }
      case "geopoint":
        try {
          const [lat, long] = value?.split(",");

          if (isNumeric(lat) && isNumeric(long)) {
            return new firebase.firestore.GeoPoint(Number(lat), Number(long));
          }

          return new firebase.firestore.GeoPoint(0, 0);
        } catch (error) {
          console.log(error);
          return new firebase.firestore.GeoPoint(0, 0);
        }

      case "reference":
        return new DocRef(value);

      default:
        return null;
    }
  },
  number: (toType: RefiFS.IFieldType, value: number) => {
    switch (toType) {
      case "string":
        return String(value);
      case "boolean":
        return Boolean(value === 1);

      default:
        return null;
    }
  },
  boolean: (toType: RefiFS.IFieldType, value: boolean) => {
    switch (toType) {
      case "string":
        return value ? "true" : "false";
      case "number":
        return value ? 1 : 0;
      default:
        return null;
    }
  },
  map: (toType: RefiFS.IFieldType, value: Record<string, any>) => {
    switch (toType) {
      case "string":
        return JSON.stringify(value);
      case "geopoint":
        if (isFinite(value?._latitude) && isFinite(value?._longitude)) {
          return new firebase.firestore.GeoPoint(
            value?._latitude,
            value?._longitude
          );
        }

        return null;
      default:
        return null;
    }
  },
  array: (toType: RefiFS.IFieldType, value: any[]) => {
    switch (toType) {
      case "string":
        return JSON.stringify(value);
      case "map":
        return value.reduce((previous, item, index) => {
          previous[index] = item;
        }, {});
      default:
        return null;
    }
  },
  null: () => {
    return null;
  },
  timestamp: (toType: RefiFS.IFieldType, value: string) => {
    switch (toType) {
      case "string":
        return value;
      case "number":
        return Number(dayjs(value).toDate());
      default:
        return null;
    }
  },
  geopoint: (
    toType: RefiFS.IFieldType,
    { _latitude, _longitude }: { _latitude: number; _longitude: number }
  ) => {
    switch (toType) {
      case "string":
        return [_latitude, _longitude].join(",");
      case "map":
        return {
          _latitude,
          _longitude,
        };
      default:
        return null;
    }
  },
  reference: (toType: RefiFS.IFieldType, value: DocRef) => {
    switch (toType) {
      case "string":
        return value.path;
      default:
        return null;
    }
  },
};

function getDefaultValueByType(type: RefiFS.IFieldType) {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "map":
      return {};
    case "array":
      return [];
    case "null":
      return null;
    case "timestamp":
      return firebase.firestore.Timestamp.now();
    case "geopoint":
      return new firebase.firestore.GeoPoint(0, 0);
    case "reference":
      return new DocRef("/");
  }
}

export const convertFSValue = (value: any, to: RefiFS.IFieldType): any => {
  const currentType = getFireStoreType(value);
  return fieldConverter[currentType](to, value) || getDefaultValueByType(to);
};
