import React, { ReactElement, useState } from "react";
import { Textarea } from "@zendeskgarden/react-forms";

interface IEditableFieldProps {
  editValue: string | number;
  editVariable: {
    name: string;
    value: string | number;
  };
  exitEdit: () => void;
  onChange: (string) => void;
  submitEdit: () => void;
}

const EditableField = ({
  editValue,
  editVariable,
  exitEdit,
  onChange,
  submitEdit,
}: IEditableFieldProps): ReactElement => {
  const [value, setValue] = useState(editValue);
  const [name, setName] = useState(editVariable.name);

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (e.key) {
      case "Escape": {
        exitEdit();
        break;
      }
      case "Enter": {
        if (e.ctrlKey || e.metaKey) {
          onChange(value);
          submitEdit();
        }
        break;
      }
    }
    e.stopPropagation();
  };

  return (
    <div className="absolute top-0 left-0 z-10 flex flex-row w-full h-full text-sm shadow-lg ring-1 ring-blue-400">
      <input
        className="w-full h-full outline-none focus:bg-blue-100 p-1.5 transition-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={1}
        // isCompact
        // minRows={1}
        // maxRows={5}
        // isBare
        onKeyDown={handleOnKeyDown}
        className="w-full h-full border-none outline-none focus:bg-blue-100 ring-1 ring-blue-400 p-1.5 transition-none text-sm"
      />
      <div className="w-7">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default EditableField;
