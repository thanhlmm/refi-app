import {
  changedDocAtom,
  deletedDocsAtom,
  newDocsAtom,
} from "@/atoms/firestore";
import {
  actionCommitChange,
  actionReverseChange,
} from "@/atoms/firestore.action";
import { isShowPreviewChangeModalAtom } from "@/atoms/ui";
import PathInput from "@/components/PathInput";
import { Button, IconButton } from "@zendeskgarden/react-buttons";
import React, { useEffect, useState } from "react";
import { useRecoilCallback, useSetRecoilState } from "recoil";

const NavBar = () => {
  const setShowChangeModal = useSetRecoilState(isShowPreviewChangeModalAtom);
  // const isCommittable = useRecoilValue(isCommittableAtom);
  const [isCommittable, setCommittable] = useState(false);

  const checkCommittable = useRecoilCallback(({ snapshot }) => async () => {
    const changedDocs = await snapshot.getPromise(changedDocAtom);
    const newDocs = await snapshot.getPromise(newDocsAtom);
    const deletedDocs = await snapshot.getPromise(deletedDocsAtom);
    setCommittable(
      changedDocs.length > 0 || newDocs.length > 0 || deletedDocs.length > 0
    );
  });

  useEffect(() => {
    const id = setInterval(() => {
      checkCommittable();
    }, 300);

    return () => {
      clearInterval(id);
    };
  }, []);

  console.count("NavBar render");
  console.log(isCommittable);

  return (
    <div className="flex flex-row space-x-2">
      <div className="flex flex-row space-x-2">
        <Button
          size="small"
          onClick={() => setShowChangeModal(true)}
          disabled={!isCommittable}
        >
          Preview changes
        </Button>
        <Button
          isPrimary
          size="small"
          disabled={!isCommittable}
          onClick={actionCommitChange}
        >
          Commit
        </Button>
        <IconButton isPill size="small" onClick={actionReverseChange}>
          <div className="w-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </IconButton>
      </div>
      <div className="w-px h-full" />
      <div className="w-full">
        <PathInput />
      </div>
    </div>
  );
};

export default NavBar;
