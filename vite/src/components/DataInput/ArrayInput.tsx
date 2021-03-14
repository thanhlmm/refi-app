import React from "react";
import { fieldAtom, parseFSUrl } from "@/atoms/firestore";
import { setRecoilExternalState } from "@/atoms/RecoilExternalStatePortal";
import { newFieldAtom } from "@/atoms/ui";

interface IArrayInputProps {
  fieldPath: string;
  toggleExpand: (boolean) => void;
}

const ArrayInput = ({ fieldPath, toggleExpand }: IArrayInputProps) => {
  const handleAddProperty = async () => {
    const fieldAtomInstance = fieldAtom(fieldPath);
    const { path, field } = parseFSUrl(fieldPath);
    setRecoilExternalState(fieldAtomInstance, (value: any[]) => {
      setRecoilExternalState(newFieldAtom(path), field + "." + value.length);
      return [...value, ""];
    });
    toggleExpand(true);
  };

  return (
    <div className="p-0.5">
      <button
        role="button"
        className="flex flex-row items-center justify-center p-1 text-xs bg-white border border-gray-300"
        onClick={() => handleAddProperty()}
      >
        <div className="inline-block w-4 mr-1 text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        Add item
      </button>
    </div>
  );
};

export default ArrayInput;
