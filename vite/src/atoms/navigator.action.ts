import { propertyListAtom } from "./navigator";
import { setRecoilExternalState } from "./RecoilExternalStatePortal";

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
  setRecoilExternalState(propertyListAtom(collectionPath), (propertyList) => [
    property,
    ...propertyList,
  ]);
};
