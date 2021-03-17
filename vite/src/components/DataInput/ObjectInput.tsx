import React from "react";
import { fieldAtom, parseFSUrl } from "@/atoms/firestore";
import { setRecoilExternalState } from "@/atoms/RecoilExternalStatePortal";
import { uniqueId } from "lodash";
import { FIELD_KEY_PREFIX } from "@/utils/contant";
import { newFieldAtom } from "@/atoms/ui";

interface IObjectInputProps {
  fieldPath: string;
  toggleExpand: (boolean) => void;
}

const ObjectInput = ({ fieldPath, toggleExpand }: IObjectInputProps) => {
  const handleAddProperty = async () => {
    const fieldAtomInstance = fieldAtom(fieldPath);
    const { path, field } = parseFSUrl(fieldPath);
    const newFieldName = uniqueId(FIELD_KEY_PREFIX);
    setRecoilExternalState(fieldAtomInstance, (value: any) => ({
      ...value,
      [newFieldName]: "",
    }));
    toggleExpand(true);
    setRecoilExternalState(newFieldAtom(path), field + "." + newFieldName);
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
        Add property
      </button>
    </div>
  );
};

export default ObjectInput;
