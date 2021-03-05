import { setRecoilExternalState } from "./RecoilExternalStatePortal";
import { isModalPickProperty } from "./ui";

export const actionToggleModalPickProperty = (status?: boolean): void => {
  setRecoilExternalState(isModalPickProperty, (curStatus) =>
    status === undefined ? !curStatus : status
  );
};
