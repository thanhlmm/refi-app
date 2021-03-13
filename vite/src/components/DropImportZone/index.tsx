import React from "react";
import { useDropArea } from "react-use";
import classNames from "classnames";
import { actionToggleImportModal } from "@/atoms/ui.action";
import { useSetRecoilState } from "recoil";
import { importFileAtom } from "@/atoms/ui";

interface IDropImportZoneProps {
  isOver: boolean;
}

const DropImportZone = ({ isOver }: IDropImportZoneProps) => {
  const setFile = useSetRecoilState(importFileAtom);
  const handleOnFileDrop = (files: File[]) => {
    setFile(files[0]);
    actionToggleImportModal(true);
  };

  const [bond, state] = useDropArea({
    onFiles: handleOnFileDrop,
  });

  return (
    <div
      {...bond}
      className={classNames(
        "absolute top-0 left-0 z-10 flex flex-col items-center justify-center w-full h-full text-gray-500 bg-gray-300 bg-opacity-50 rounded",
        {
          ["opacity-0"]: !state.over,
        }
      )}
    >
      <div className="pointer-events-none">
        <svg
          className="w-36"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <div>Drop file here to import</div>
      </div>
    </div>
  );
};

export default DropImportZone;
