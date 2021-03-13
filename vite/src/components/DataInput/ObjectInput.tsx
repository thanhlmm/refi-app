import React from "react";
import { fieldAtom } from "@/atoms/firestore";
import { setRecoilExternalState } from "@/atoms/RecoilExternalStatePortal";
import { uniqueId } from "lodash";
import { FIELD_KEY_PREFIX } from "@/utils/contant";

interface IObjectInputProps {
  fieldPath: string;
}

const ObjectInput = ({ fieldPath }: IObjectInputProps) => {
  const handleAddProperty = async () => {
    const fieldAtomInstance = fieldAtom(fieldPath);
    // const mapValue = await getRecoilExternalLoadable(fieldAtomInstance).toPromise();
    // setRecoilExternalState(fieldAtomInstance, (value) => ({
    //   ...value,
    //   [uniqueId(FIELD_KEY_PREFIX)]: "",
    // }));
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
