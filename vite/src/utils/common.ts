import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { chunk, flatten, intersection, uniq } from "lodash";
import { isObject, simplify } from "./simplifr";
import firebase from "firebase/app";
import { IArrayOperator, INormalOperator } from "@/atoms/navigator";

export const isCollection = (path = ""): boolean => {
  if (path === "/") {
    return false;
  }
  return !Boolean(path.split("/").length % 2);
};

export const prettifyPath = (path: string): string => {
  // A Good path is: Start with `/` and end without `/`
  let prettiedPath = path;
  if (prettiedPath.endsWith("/")) {
    prettiedPath.slice(0, -1);
  }

  if (!prettiedPath.startsWith("/")) {
    prettiedPath = "/" + prettiedPath;
  }

  return prettiedPath;
};

export const getPathEntities = (path: string): string[] => {
  const entities = prettifyPath(path).split("/");
  return entities.filter((entity) => entity !== "");
};

export const getParentPath = (url: string) => {
  const entities = prettifyPath(url).split("/");
  entities.pop();

  return prettifyPath(entities.join("/"));
};

export const getIdFromPath = (path: string): string | undefined => {
  if (isCollection(path)) {
    return undefined;
  }

  return getPathEntities(path).pop();
};

export const getRecursivePath = (url: string) => {
  const collections = prettifyPath(url)
    .split("/")
    .reduce((prev: string[], current: string) => {
      const lastPath = prev[prev.length - 1];
      return [...prev, [lastPath, current].join("/").replace("//", "/")];
    }, []);
  return ["/", ...collections];
};

export const getListCollections = (
  path: string,
  availablePaths: string[]
): string[] => {
  const normalPath = prettifyPath(path);
  return availablePaths.filter(
    (availablePath) =>
      availablePath.startsWith(normalPath) &&
      getPathEntities(normalPath).length + 1 ===
        getPathEntities(availablePath).length
  );
};

export const toBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const getAllColumns = (data: ClientDocumentSnapshot[]): string[] => {
  const allColumns = data.map((row) => Object.keys(row.data()));
  return uniq(flatten(allColumns));
};

export const getAllColumnsRecursive = (
  data: ClientDocumentSnapshot[]
): string[] => {
  // TODO: Consider limit data for improve performance
  const allColumns = data
    .map((row) => simplify(row.data(), ".", "root"))
    .map((objData) => Object.keys(objData))
    .map((listKey) =>
      listKey.map((key) => key.substr("root.".length)).filter((key) => key)
    );
  return uniq(flatten(allColumns));
};

export const getCollectionPath = (path: string) => {
  const isCollectionType = isCollection(path);
  return isCollectionType ? path : getParentPath(path);
};

export const getSampleColumn = (data: ClientDocumentSnapshot[]): string[] => {
  const allColumns = data.map((row) => Object.keys(row.data()));
  const chunks = chunk(allColumns, 2);
  const chunksColumn = chunks.map((smallChunks) =>
    intersection(...smallChunks)
  );
  // TODO: Improve when we add more data
  return uniq(flatten(chunksColumn))
    .sort((a, b) => a.localeCompare(b))
    .filter((_) => _);
};

export const transformFSDoc = (doc: ClientDocumentSnapshot) => {
  return {
    ...doc.data(),
    __path: doc.ref.path,
    __id: doc.id,
  };
};

interface ITableSubRow {
  field: string;
  value: any | { type: RefiFS.IFieldType };
  subRows?: any[];
}

export const buildTableSubRows = (
  rows: { field: string; value: any }[],
  level = 1
): ITableSubRow[] => {
  return rows
    .filter(({ field }) => field.split(".").length === level && field !== "")
    .sort((a, b) => a.field.localeCompare(b.field))
    .reduce((rowWithSub: ITableSubRow[], { field, value }) => {
      if (isObject(value)) {
        rowWithSub.push({
          field,
          value,
          ...(["map", "array"].includes(value?.type)
            ? {
                subRows: buildTableSubRows(
                  rows.filter(
                    (row) => row.field.startsWith(field) && row.field !== field
                  ),
                  level + 1
                ),
              }
            : {}),
        });
        return rowWithSub;
      }

      rowWithSub.push({ field, value });
      return rowWithSub;
    }, []);
};

export const reorder = function <T>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const removeFirebaseSerializeMetaData = (
  docStr: string,
  metaDataField: string[] = ["__id__", "__path__"]
): string => {
  try {
    const docData: any | any[] = JSON.parse(docStr);
    if (Array.isArray(docData)) {
      docData.forEach((doc) => {
        metaDataField.forEach((field) => {
          delete doc[field];
        });
      });
    } else {
      metaDataField.forEach((field) => {
        delete docData[field];
      });
    }

    return JSON.stringify(
      docData,
      (key, value) => {
        if (value == null || value.constructor != Object) {
          return value;
        }
        return Object.keys(value)
          .sort()
          .reduce((s, k) => {
            s[k] = value[k];
            return s;
          }, {});
      },
      2
    );
  } catch (error) {
    console.log("Error remove metadata");
    console.log(error);
    return docStr;
  }
};

export const addFirebaseDocSerializeMetaData = (
  docStr: string,
  id: string,
  path: string
): string => {
  try {
    const docData: Record<string, any> = JSON.parse(docStr);
    docData["__id__"] = id;
    docData["__path__"] = path;

    return JSON.stringify(docData);
  } catch (error) {
    console.log("Error add metadata");
    console.log(error);
    return docStr;
  }
};

export const ignoreBackdropEvent = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  event.preventDefault();
  event.stopPropagation();
};

export function readerFilePromise(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.readAsText(file);
  });
}

export function beautifyId(id: string): string {
  if (id.length < 7) {
    return id;
  }

  return id.slice(0, 3) + "..." + id.slice(-4);
}

export const newId = (): string => {
  return firebase.firestore().collection("feedbacks").doc().id;
};

export function isNumeric(input: string | number): boolean {
  if (typeof input === "number") return true;
  if (typeof input !== "string") return false;
  return !isNaN(+input) && !isNaN(parseFloat(input));
}

export function mapHotKeys(sequences: string | string[]): string | string[] {
  const replacer = (input: string) =>
    window.os === "Darwin" ? input : input.replaceAll("command", "Control");

  if (Array.isArray(sequences)) {
    return sequences.map(replacer);
  }

  return replacer(sequences);
}

export function isArrayOp(
  op: INormalOperator | IArrayOperator
): op is IArrayOperator {
  return Array.isArray(op.values);
}
