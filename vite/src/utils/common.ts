import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { chunk, flatten, intersection, uniq } from "lodash";

export const isCollection = (path = ""): boolean => {
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

export const getAllCollectionsPath = (url: string) => {
  const collections = prettifyPath(url)
    .split("/")
    .reduce((prev: string[], current: string) => {
      const lastPath = prev[prev.length - 1];
      return [...prev, [lastPath, current].join("/").replace("//", "/")];
    }, [])
    .filter((collection, index) => index % 2);
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

export const getSampleColumn = (data: ClientDocumentSnapshot[]): string[] => {
  const allColumns = data.map((row) => Object.keys(row.data()));
  const chunks = chunk(allColumns, 2);
  const chunksColumn = chunks.map((smallChunks) =>
    intersection(...smallChunks)
  );
  // TODO: Improve when we add more data
  return uniq(flatten(chunksColumn));
};

export const transformFSDoc = (doc: ClientDocumentSnapshot) => {
  return {
    ...doc.data(),
    __path: doc.ref.path,
    __id: doc.id,
  };
};
