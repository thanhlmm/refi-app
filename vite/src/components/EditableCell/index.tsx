import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import { Input } from "@zendeskgarden/react-forms";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  buildFSUrl,
  docAtom,
  fieldAtom,
  fieldChangedAtom,
} from "@/atoms/firestore";
import classNames from "classnames";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";

interface IReadonlyCell {
  value?: string;
  children?: ReactNode;
}

interface IEditableCell {
  row: ClientDocumentSnapshot;
  column: {
    id: string;
  };
}

const EditableCell = ({
  row,
  column: { id },
}: IEditableCell): React.ReactElement => {
  const fieldPath = buildFSUrl({ path: row.ref.path, field: id });
  const [value, setValue] = useRecoilState(fieldAtom(fieldPath));
  const isFieldChanged = useRecoilValue(fieldChangedAtom(fieldPath));
  const [isFocus, setFocus] = useState(false);
  const [instanceValue, setInstanceValue] = useState(value);
  const [isHighlight, toggleHighlight] = useState(false);

  const onChange = (e) => {
    setInstanceValue(e.target.value);
  };

  const onBlur = () => {
    setFocus(false);
    if (instanceValue !== value) {
      setValue(instanceValue);
    }
  };

  const toggleHight = () => {
    toggleHighlight(true);
    setTimeout(() => {
      toggleHighlight(false);
    }, 300);
  };

  // Sync the external into instanceValue
  useEffect(() => {
    if (value !== instanceValue) {
      setInstanceValue(value);
      toggleHight();
    }
  }, [value]);

  const onFocus = () => {
    setFocus(true);
  };

  if (!isFocus) {
    return (
      <div className="w-full h-full px-px">
        <input
          className={classNames(
            "focus:ring-1 focus:ring-blue-400 w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5",
            {
              ["bg-red-300"]: isFieldChanged,
              ["bg-yellow-200 transition-colors duration-300"]: isHighlight,
            }
          )}
          value={instanceValue}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
    );
  }

  return (
    <div onClick={onFocus} className="w-full h-full px-px">
      {instanceValue}
    </div>
  );
};

export const ReadOnlyField = ({ value, children }: IReadonlyCell) => {
  if (children) {
    return <div className="w-full h-full px-px">{children}</div>;
  }
  return (
    <div className="w-full h-full px-px">
      <input
        className="focus:ring-1 focus:ring-blue-400 w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5"
        value={value}
      />
    </div>
  );
};

export const IDField = ({ value }: { value: string }) => {
  return (
    <div className="relative w-full h-full px-px">
      <input
        className="focus:ring-1 focus:ring-blue-400 w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5"
        value={value}
      />

      <div className="absolute w-3 transform -translate-y-1/2 cursor-pointer right-2 top-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      </div>
    </div>
  );
};

export default EditableCell;
