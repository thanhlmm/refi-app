import { NSFireStore } from "@/types/FS";
import { chunk, flatten, intersection } from "lodash";

export const isCollection = (path = ""): boolean => {
  return !Boolean(path.split("/").length % 2);
};

export const toBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const getSampleColumn = (data: NSFireStore.IDocSnapshot[]): string[] => {
  const allColumns = data.map((row) => Object.keys(row.data()));
  const chunks = chunk(allColumns, 2);
  const chunksColumn = chunks.map((smallChunks) =>
    intersection(...smallChunks)
  );
  // TODO: Improve when we add more data
  return flatten(chunksColumn);
};

export const transformFSDoc = (doc: NSFireStore.IDocSnapshot) => {
  return {
    ...doc.data(),
    __path: doc.ref.path,
    __id: doc.id,
  };
};
