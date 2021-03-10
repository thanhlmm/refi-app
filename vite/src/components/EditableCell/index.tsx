import { buildFSUrl, fieldAtom, fieldChangedAtom } from "@/atoms/firestore";
import {
  actionRemoveFieldKey,
  actionUpdateFieldKey,
} from "@/atoms/firestore.action";
import { FIELD_TYPES } from "@/atoms/navigator";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getFireStoreType, isObject } from "@/utils/simplifr";
import { useClickAway } from "ahooks";
import classNames from "classnames";
import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import DataInput from "../DataInput";
import DateTimePicker from "../DataInput/DateTimePicker";
import DropdownMenu from "../DropdownMenu";

interface IReadonlyCell {
  value?: string;
  children?: ReactNode;
}

interface IEditableCell {
  row: ClientDocumentSnapshot;
  column: {
    id: string;
  };
  value: any;
  tabIndex: number;
}

const EditableCell = ({
  row,
  column: { id },
  tabIndex,
}: IEditableCell): React.ReactElement => {
  const fieldPath = buildFSUrl({ path: row.ref.path, field: id });
  const [value, setValue] = useRecoilState(fieldAtom(fieldPath));
  const isFieldChanged = useRecoilValue(fieldChangedAtom(fieldPath));
  const [isFocus, setFocus] = useState(false);
  const [isEditable, setEditable] = useState(false);
  const [instanceValue, setInstanceValue] = useState(value);
  const [isHighlight, toggleHighlight] = useState(false);
  const wrapperEl = useRef(null);
  const inputEl = useRef<HTMLInputElement>(null);

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
      // TODO: Check if value return is null, 0, ""
      setInstanceValue(value || "");
      toggleHight();
    }
  }, [value]);

  const onFocus = () => {
    setFocus(true);
  };

  useClickAway(() => {
    setFocus(false);
  }, wrapperEl);

  const handleKeyDownCapture = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // TODO: Capture copy command here
    inputEl.current?.focus();
  };

  return (
    <div
      className="w-full h-full outline-none"
      onClick={() => setFocus(true)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onKeyDownCapture={handleKeyDownCapture}
      ref={wrapperEl}
      tabIndex={tabIndex}
    >
      <input
        ref={inputEl}
        className={classNames(
          "w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5",
          {
            ["bg-red-300"]: isFieldChanged,
            ["bg-yellow-200 transition-colors duration-300"]: isHighlight,
            ["ring-1 ring-blue-400 bg-blue-100 ring-inset"]: isFocus,
          }
        )}
        value={instanceValue}
        onChange={onChange}
        onBlur={onBlur}
        cm-template="rowContext"
      />
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
        readOnly
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
        readOnly
        disabled
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

export const EditablePropertyValue = ({
  row,
  column: { id },
  value: tableValue,
  tabIndex,
}: IEditableCell): React.ReactElement => {
  const fieldPath = buildFSUrl({ path: row.ref.path, field: id });
  const [value, setValue] = useRecoilState(fieldAtom(fieldPath));
  const isFieldChanged = useRecoilValue(fieldChangedAtom(fieldPath));
  const [instanceValue, setInstanceValue] = useState(value);
  const [isHighlight, toggleHighlight] = useState(false);
  const [isHovered, setHovered] = useState(false);
  const [isFocused, setFocused] = useState(false);
  const wrapperEl = useRef(null);
  const inputEl = useRef<HTMLTextAreaElement>(null);

  const onChange = (value) => {
    setInstanceValue(value);
  };

  const onBlur = () => {
    setFocused(false);
    if (instanceValue !== value) {
      setValue(instanceValue);
    }
  };

  const onFocus = () => {
    setFocused(true);
  };

  const onKeyDown = () => {
    setFocused(true);
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
      // TODO: Check if value return is null, 0, ""
      setInstanceValue(value || "");
      toggleHight();
    }
  }, [value]);

  const menuOptions = useMemo(() => {
    return FIELD_TYPES.map((fieldType) => ({
      isSelected: false, // TODO: Map to real data
      title: fieldType,
      hint: fieldType,
      onClick: () => {
        console.log("clicked ", fieldType);
      },
    }));
  }, []);

  const fieldType = useMemo(() => {
    return getFireStoreType(instanceValue);
  }, [instanceValue]);

  if (isObject(tableValue)) {
    let editorElement: ReactElement | null = null;
    if (tableValue.type === "timestamp") {
      editorElement = (
        <DateTimePicker value={instanceValue as any} onChange={onChange} />
      );
    }

    const addFieldable = ["map", "array"].includes(tableValue.type);

    return (
      <div
        className="w-full h-full outline-none p-0.5 relative"
        ref={wrapperEl}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={classNames("opacity-0", {
            ["opacity-100"]: isHovered && !isFocused,
          })}
        >
          {addFieldable && (
            <button
              role="button"
              className="flex flex-row items-center justify-center p-1 text-xs bg-white border border-gray-300 rounded shadow-sm"
              onClick={() => {}}
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
              Add field
            </button>
          )}

          <div
            className={classNames(
              "absolute opacity-0 top-0.5 right-0.5 hover:opacity-100 transition-opacity",
              {
                ["opacity-70"]: isHovered && !isFocused,
              }
            )}
          >
            <DropdownMenu menu={menuOptions}>
              <button
                role="button"
                className="p-1 text-xs bg-white border border-gray-300 rounded shadow-sm"
              >
                {fieldType}
              </button>
            </DropdownMenu>
          </div>
        </div>
        {editorElement}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full outline-none"
      ref={wrapperEl}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={classNames(
          "absolute opacity-0 top-0.5 right-0.5 hover:opacity-100 transition-opacity",
          {
            ["opacity-70"]: isHovered && !isFocused,
          }
        )}
      >
        <DropdownMenu menu={menuOptions}>
          <button
            role="button"
            className="p-1 text-xs bg-white border border-gray-300 rounded shadow-sm"
          >
            {fieldType}
          </button>
        </DropdownMenu>
      </div>
      <DataInput
        ref={inputEl}
        className={classNames({
          ["bg-red-300"]: isFieldChanged,
          ["bg-yellow-200 transition-colors duration-300"]: isHighlight,
        })}
        tabIndex={tabIndex}
        value={instanceValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

interface IEditablePropertyFieldProps {
  row: ClientDocumentSnapshot;
  column: {
    id: string;
  };
  value: any;
  tabIndex: number;
  canExpand: boolean;
  isExpanded: boolean;
  toggleExpand: () => void;
}

export const EditablePropertyField = ({
  row,
  column: { id },
  tabIndex,
  canExpand,
  isExpanded,
  toggleExpand,
}: IEditablePropertyFieldProps): React.ReactElement => {
  const fieldPath = buildFSUrl({ path: row.ref.path, field: id });
  const isFieldChanged = useRecoilValue(fieldChangedAtom(fieldPath));
  const [instanceValue, setInstanceValue] = useState(id);
  const [isHighlight, toggleHighlight] = useState(false);
  const [isHovered, setHovered] = useState(false);
  const [isFocused, setFocused] = useState(false);
  const wrapperEl = useRef(null);
  const inputEl = useRef<HTMLTextAreaElement>(null);

  const fieldData = useMemo(() => {
    const entities = id.split(".");
    const field = entities.pop() || entities;
    return {
      field,
      parent: entities,
    };
  }, [id]);

  const onChange = useCallback(
    (e) => {
      const prefix =
        fieldData.parent.length > 0 ? fieldData.parent.join(".") + "." : "";
      setInstanceValue(prefix + e.target.value.substr(prefix.length));
    },
    [fieldData]
  );

  const onBlur = () => {
    if (instanceValue !== id) {
      actionUpdateFieldKey(fieldPath, instanceValue);
    }
  };

  const onKeyDown = () => {
    // TODO: Reverse when user press `esc`. Commit change when hit `enter`
    setFocused(true);
  };

  const handleRemoveKey = () => {
    actionRemoveFieldKey(fieldPath);
  };

  return (
    <div
      className="relative w-full outline-none"
      ref={wrapperEl}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {canExpand && (
        <div
          className={classNames(
            "absolute top-1 -left-6 opacity-80 hover:opacity-100 transition-opacity z-20"
          )}
        >
          <button
            role="button"
            className="p-1 text-xs outline-none"
            onClick={toggleExpand}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className={`w-3 transition-transform transform-gpu ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}
      <div
        className={classNames(
          "absolute opacity-0 top-0.5 right-0.5 hover:opacity-100 transition-opacity",
          {
            ["opacity-70"]: isHovered && !isFocused,
          }
        )}
      >
        <button
          role="button"
          className="w-6 p-1 text-xs bg-white border border-gray-300 rounded shadow-sm"
          onClick={handleRemoveKey}
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <DataInput
        ref={inputEl}
        className={classNames("font-bold", {
          ["bg-red-300"]: isFieldChanged,
          ["bg-yellow-200 transition-colors duration-300"]: isHighlight,
        })}
        tabIndex={tabIndex}
        value={instanceValue}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default EditableCell;
