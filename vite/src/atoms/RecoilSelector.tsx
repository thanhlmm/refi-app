import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { changedDocAtom, newDocsAtom, deletedDocsAtom } from "./firestore";
import { setRecoilExternalState } from "./RecoilExternalStatePortal";
import { isCommittableAtom } from "./ui";

const RecoilSelector = () => {
  const changedDocs = useRecoilValue(changedDocAtom);
  const newDocs = useRecoilValue(newDocsAtom);
  const deletedDocs = useRecoilValue(deletedDocsAtom);

  useEffect(() => {
    const isCommittable =
      changedDocs.length > 0 || newDocs.length > 0 || deletedDocs.length > 0;

    setRecoilExternalState(isCommittableAtom, isCommittable);
  }, [changedDocs, newDocs, deletedDocs]);

  return null;
};

export default RecoilSelector;
