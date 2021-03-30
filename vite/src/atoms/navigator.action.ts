import { prettifyPath, removeFirebaseSerializeMetaData } from "@/utils/common";
import { FILTER_PREFIX } from "@/utils/contant";
import exportFromJSON from "export-from-json";
import {
  serializeDocumentSnapshot,
  serializeQuerySnapshot,
} from "firestore-serializers";
import { uniq, uniqueId } from "lodash";
import { collectionWithQueryAtom, docAtom } from "./firestore";
import { actionAddPathExpander } from "./firestore.action";
import {
  navigatorCollectionPathAtom,
  navigatorPathAtom,
  propertyListAtom,
  querierAtom,
  queryVersionAtom,
  sorterAtom,
  WhereFilterOp,
} from "./navigator";
import {
  getRecoilExternalLoadable,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";
import { notifyErrorPromise } from "./ui.action";

export const actionGoTo = (path: string): void => {
  setRecoilExternalState(navigatorPathAtom, prettifyPath(path));
};

export const actionRemoveProperty = (
  collectionPath: string,
  property: string
): void => {
  setRecoilExternalState(propertyListAtom(collectionPath), (propertyList) =>
    propertyList.filter((item) => item !== property)
  );
};

export const actionAddProperty = (
  collectionPath: string,
  property: string
): void => {
  setRecoilExternalState(propertyListAtom(collectionPath), (propertyList) =>
    uniq([property, ...propertyList].filter(Boolean))
  );
};

export const actionSetProperty = (
  collectionPath: string,
  properties: string[]
): void => {
  setRecoilExternalState(propertyListAtom(collectionPath), properties);
};

export const actionSubmitQuery = async (
  withQuerier = true
): Promise<boolean> => {
  setRecoilExternalState(queryVersionAtom, ({ queryVersion }) => ({
    queryVersion: queryVersion + 1,
    withQuerier,
  }));

  if (!withQuerier) {
    const collectionPath = await getRecoilExternalLoadable(
      navigatorCollectionPathAtom
    ).toPromise();

    setRecoilExternalState(querierAtom(collectionPath), (querierOptions) =>
      querierOptions.map((option) => ({ ...option, isActive: false }))
    );
  }

  return true;
};

export const actionRemoveSorter = (
  collectionPath: string,
  sorterId: string
): void => {
  setRecoilExternalState(sorterAtom(collectionPath), (sorterList) =>
    sorterList.filter((item) => item.id !== sorterId)
  );
};

export const actionAddSorter = (
  collectionPath: string,
  value: { field: string; sort: "asc" | "desc" }
): void => {
  const newSorter = {
    ...value,
    id: uniqueId("fs.sorter"),
  };
  setRecoilExternalState(sorterAtom(collectionPath), (sorterList) => [
    newSorter,
    ...sorterList.filter((sorter) => sorter.field !== newSorter.field),
  ]);
};

export const actionExportCollectionJSON = async (collectionPath: string) => {
  return window
    .send("fs.exportCollection", {
      path: collectionPath,
    })
    .then(({ docs }: { docs: string }) => {
      const docsAsString = removeFirebaseSerializeMetaData(docs, ["__path__"]);
      exportFromJSON({
        data: docsAsString,
        fileName: collectionPath.replaceAll("/", "_"),
        exportType: "json",
      });

      return true;
    })
    .catch(notifyErrorPromise);
};

export const actionExportCollectionCSV = async (collectionPath: string) => {
  return window
    .send("fs.exportCollection", {
      path: collectionPath,
    })
    .then(({ docs }: { docs: string }) => {
      const docsAsString = removeFirebaseSerializeMetaData(docs, ["__path__"]);
      exportFromJSON({
        data: docsAsString,
        fileName: collectionPath.replaceAll("/", "_"),
        exportType: "csv",
      });

      return true;
    })
    .catch(notifyErrorPromise);
};

export const actionExportViewJSON = async (
  allFields = true
): Promise<boolean> => {
  const collectionPath = await getRecoilExternalLoadable(
    navigatorCollectionPathAtom
  ).toPromise();
  const docs = await getRecoilExternalLoadable(
    collectionWithQueryAtom(collectionPath)
  ).toPromise();

  const docsAsString = removeFirebaseSerializeMetaData(
    serializeQuerySnapshot({
      docs,
    }),
    ["__path__"]
  );

  exportFromJSON({
    data: docsAsString,
    fileName: collectionPath.replaceAll("/", "_"),
    exportType: "json",
  });

  return true;
};

export const actionExportViewCSV = async (
  allFields = true
): Promise<boolean> => {
  const collectionPath = await getRecoilExternalLoadable(
    navigatorCollectionPathAtom
  ).toPromise();
  const docs = await getRecoilExternalLoadable(
    collectionWithQueryAtom(collectionPath)
  ).toPromise();

  const docsAsString = removeFirebaseSerializeMetaData(
    serializeQuerySnapshot({
      docs,
    }),
    ["__path__"]
  );

  exportFromJSON({
    data: docsAsString,
    fileName: collectionPath.replaceAll("/", "_"),
    exportType: "csv",
  });

  return true;
};

export const actionExportDocJSON = async (
  docPath: string
): Promise<boolean> => {
  const doc = await getRecoilExternalLoadable(docAtom(docPath)).toPromise();

  if (!doc) {
    // TODO: Get doc local memory not found
    // TODO: Throw error not found

    return false;
  }

  const docsAsString = removeFirebaseSerializeMetaData(
    serializeDocumentSnapshot(doc),
    ["__path__"]
  );

  exportFromJSON({
    data: docsAsString,
    fileName: doc.id,
    exportType: "json",
  });

  return true;
};

export const actionExportDocCSV = async (docPath: string): Promise<boolean> => {
  const doc = await getRecoilExternalLoadable(docAtom(docPath)).toPromise();

  if (!doc) {
    // TODO: Throw error not found

    return false;
  }

  const docsAsString = removeFirebaseSerializeMetaData(
    serializeDocumentSnapshot(doc),
    ["__path__"]
  );

  exportFromJSON({
    data: [JSON.parse(docsAsString)],
    fileName: doc.id,
    exportType: "csv",
  });

  return true;
};

export const actionAddFilter = (
  field: string,
  type: WhereFilterOp,
  collectionPath: string
): void => {
  setRecoilExternalState(querierAtom(collectionPath), (filters) => [
    ...filters,
    {
      id: uniqueId(FILTER_PREFIX),
      field,
      operator: {
        type: type,
        values: ["in", "not-in", "array-contains-any"].includes(type)
          ? [""]
          : ("" as any),
      },
      isActive: true,
    },
  ]);
};

export const actionPathExpand = (path: string) => {
  window
    .send("fs.pathExpander", { path: prettifyPath(path) })
    .then((response: string[]) => {
      actionAddPathExpander(response);
    })
    .catch(notifyErrorPromise);
};
