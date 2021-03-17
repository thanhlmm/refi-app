import { setRecoilExternalState } from "./RecoilExternalStatePortal";
import {
  importCollectionPathAtom,
  isImportModalAtom,
  isModalPickProperty,
  isParsingLargeDataAtom,
} from "./ui";

export const actionToggleModalPickProperty = (status?: boolean): void => {
  setRecoilExternalState(isModalPickProperty, (curStatus) =>
    status === undefined ? !curStatus : status
  );
};

export const actionToggleImportModal = (
  path: string,
  status?: boolean
): void => {
  setRecoilExternalState(importCollectionPathAtom, path);
  setRecoilExternalState(isImportModalAtom, (curStatus) =>
    status === undefined ? !curStatus : status
  );
};

export const actionTriggerLoadData = (totalDocs): void => {
  setRecoilExternalState(isParsingLargeDataAtom, { totalDocs }); // AUTO Trigger loading suspense
};
