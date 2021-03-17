import {
  itemIsDocumentReference,
  itemIsGeoPoint,
  itemIsTimestamp,
} from "firestore-serializers";

function defaults() {
  return {
    root: "root",
    dilimiter: ".",
  };
}

export function getFireStoreType(object: any): RefiFS.IFieldType {
  switch (true) {
    case itemIsDocumentReference(object):
      return "reference";
    case itemIsGeoPoint(object):
      return "geopoint";
    case itemIsTimestamp(object):
      return "timestamp";
    case Array.isArray(object):
      return "array";
    case object === true || object === false:
      return "boolean";
    case typeof object === "number" || typeof object === "bigint":
      return "number";
    case object === null:
      return "null";
    case typeof object === "string":
      return "string";
  }

  return "map";
}

export type IPrimitiveType = number | string | boolean | null;
export interface IValueType {
  type: "reference" | "geopoint" | "timestamp" | "array" | "map";
  childs: any[];
}

export function simplify(
  obj: any,
  dilimiter?: string,
  root?: string
): Record<string, IValueType | IPrimitiveType> {
  dilimiter = dilimiter || defaults().dilimiter;
  root = root || defaults().root;

  return simplifyNode({}, root, obj, dilimiter);
}

export function desimplify(data, path, dilimiter) {
  dilimiter = dilimiter || defaults().dilimiter;
  path = path || defaults().root;

  return dive(path);

  function dive(path) {
    let obj;
    const node = data[path];

    if (typeof node === "undefined" || node === null) return node;

    if (node.type === "array") {
      obj = [];
      node.childs.forEach(function (key) {
        obj.push(dive(path + dilimiter + key));
      });
    } else if (node.type === "object") {
      obj = {};
      node.childs.forEach(function (key) {
        obj[key] = dive(path + dilimiter + key);
      });
    } else obj = node;

    return obj;
  }
}

function simplifyNode(
  data: Record<string, any> | any[],
  path: string,
  obj: unknown,
  dilimiter: string
): Record<string, any> {
  dilimiter = dilimiter || defaults().dilimiter;

  dive(obj, path);

  return data;

  function dive(obj, path) {
    data[path] = {
      type: "map",
      childs: [],
    };

    if (isArray(obj)) {
      data[path].type = "array";
      for (let i = -1, l = obj.length; ++i < l; ) {
        data[path].childs.push(i);
        dive(obj[i], path + dilimiter + i);
      }
    } else if (isObject(obj)) {
      data[path].type = getFireStoreType(obj);
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          data[path].childs.push(key);
          dive(obj[key], path + dilimiter + key);
        }
      }
    } else data[path] = obj;

    return data;
  }
}

export function isArray(_: any) {
  return Object.prototype.toString.call(_) === "[object Array]";
}

export function isObject(_: any) {
  return Object.prototype.toString.call(_) === "[object Object]";
}
