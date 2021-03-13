import { setRecoilExternalState } from "./RecoilExternalStatePortal";
import {
  isImportModalAtom,
  isModalPickProperty,
  isParsingLargeDataAtom,
} from "./ui";

export const actionToggleModalPickProperty = (status?: boolean): void => {
  setRecoilExternalState(isModalPickProperty, (curStatus) =>
    status === undefined ? !curStatus : status
  );
};

export const actionToggleImportModal = (status?: boolean): void => {
  setRecoilExternalState(isImportModalAtom, (curStatus) =>
    status === undefined ? !curStatus : status
  );
};

export const actionTriggerLoadData = (totalDocs): void => {
  setRecoilExternalState(isParsingLargeDataAtom, { totalDocs }); // AUTO Trigger loading suspense
};
