import {
  serializeDocumentSnapshot,
  serializeQuerySnapshot,
} from "firestore-serializers";
import { uniq, uniqBy, uniqueId } from "lodash";
import { collectionWithQueryAtom, docAtom } from "./firestore";
import exportFromJSON from "export-from-json";
import {
  ISorterEntity,
  navigatorCollectionPathAtom,
  propertyListAtom,
  queryVersionAtom,
  sorterAtom,
} from "./navigator";
import {
  getRecoilExternalLoadable,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";

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

export const actionSubmitQuery = (withQuerier = true): void => {
  // TODO: Try to submit along with querier
  setRecoilExternalState(queryVersionAtom, (cur) => cur + 1);
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

export const actionExportViewJSON = async (
  allFields = true
): Promise<boolean> => {
  const collectionPath = await getRecoilExternalLoadable(
    navigatorCollectionPathAtom
  ).toPromise();
  const docs = await getRecoilExternalLoadable(
    collectionWithQueryAtom(collectionPath)
  ).toPromise();

  const docsAsString = serializeQuerySnapshot({
    docs,
  });

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

  const docsAsString = serializeQuerySnapshot({
    docs,
  });

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
    // TODO: Throw error not found

    return false;
  }

  const docsAsString = serializeDocumentSnapshot(doc);

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

  const docsAsString = serializeDocumentSnapshot(doc);

  exportFromJSON({
    data: [JSON.parse(docsAsString)],
    fileName: doc.id,
    exportType: "csv",
  });

  return true;
};
