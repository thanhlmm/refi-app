import { prettifyPath, removeFirebaseSerializeMetaData } from "@/utils/common";
import { FILTER_PREFIX } from "@/utils/contant";
import exportFromJSON from "export-from-json";
import {
  serializeDocumentSnapshot,
  serializeQuerySnapshot,
} from "firestore-serializers";
import { uniq, uniqueId } from "lodash";
import { collectionWithQueryAtom, docAtom } from "./firestore";
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

export const actionGoTo = (path: string): void => {
  setRecoilExternalState(navigatorPathAtom, prettifyPath(path));
};

window.form = actionGoTo;

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
    uniq([property, ...propertyList])
  );
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
  value: { field: string; sort: "ASC" | "DESC" }
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

export const actionExportCollectionJSON = async (
  collectionPath: string
): Promise<boolean> => {
  console.trace();
  return window
    .send("fs.exportCollection", {
      path: collectionPath,
    })
    .then(({ docs }: { docs: string }) => {
      const docsAsString = removeFirebaseSerializeMetaData(docs);
      exportFromJSON({
        data: docsAsString,
        fileName: collectionPath.replaceAll("/", "_"),
        exportType: "json",
      });

      return true;
    });
};

export const actionExportCollectionCSV = async (
  collectionPath: string
): Promise<boolean> => {
  return window
    .send("fs.exportCollection", {
      path: collectionPath,
    })
    .then(({ docs }: { docs: string }) => {
      const docsAsString = removeFirebaseSerializeMetaData(docs);
      exportFromJSON({
        data: docsAsString,
        fileName: collectionPath.replaceAll("/", "_"),
        exportType: "csv",
      });

      return true;
    });
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
    })
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
    })
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
    serializeDocumentSnapshot(doc)
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
    serializeDocumentSnapshot(doc)
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
        values: "",
      },
      isActive: true,
    },
  ]);
};
