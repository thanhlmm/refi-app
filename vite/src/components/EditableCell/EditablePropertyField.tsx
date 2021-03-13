import { buildFSUrl, fieldChangedAtom } from "@/atoms/firestore";
import {
  actionUpdateFieldKey,
  actionRemoveFieldKey,
} from "@/atoms/firestore.action";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import React, { useState, useRef, useMemo, useCallback } from "react";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { useContextMenu } from "@/hooks/contextMenu";
import DataInput from "@/components/DataInput";

interface IEditablePropertyFieldProps {
  row: ClientDocumentSnapshot;
  column: {
    id: string;
  };
  tabIndex: number;
  canExpand: boolean;
  isExpanded: boolean;
  depth: number;
  toggleExpand: () => void;
}

export const EditablePropertyField = ({
  row,
  column: { id },
  tabIndex,
  canExpand,
  isExpanded,
  toggleExpand,
  depth,
}: IEditablePropertyFieldProps): React.ReactElement => {
  const fieldPath = buildFSUrl({ path: row.ref.path, field: id });
  const isFieldChanged = useRecoilValue(fieldChangedAtom(fieldPath));
  const [instanceValue, setInstanceValue] = useState(id);
  const [isHighlight, toggleHighlight] = useState(false);
  const [isHovered, setHovered] = useState(false);
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setInstanceValue(id);
    }
  };

  useContextMenu(
    "DELETE_PROPERTY",
    () => {
      actionRemoveFieldKey(fieldPath);
    },
    fieldPath
  );

  return (
    <div
      ref={wrapperEl}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={classNames("relative w-full outline-none", {
        [`border-gray-400 border-l-${Math.min(depth * 2, 8)}`]: depth > 0,
      })}
      cm-template="propertyName"
      cm-id={fieldPath}
    >
      {canExpand && (
        <div
          className={classNames(
            "absolute top-1 right-1 opacity-80 hover:opacity-100 transition-opacity z-20"
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
      <DataInput
        ref={inputEl}
        className={classNames("font-bold focus:ring-1 focus:ring-blue-400", {
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

export default EditablePropertyField;
