import { buildFSUrl, fieldAtom, fieldChangedAtom } from "@/atoms/firestore";
import { FIELD_TYPES } from "@/atoms/navigator";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getFireStoreType, IPrimitiveType, IValueType } from "@/utils/simplifr";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  ReactElement,
} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import classNames from "classnames";
import DropdownMenu from "@/components/DropdownMenu";
import DataInput from "@/components/DataInput";
import { isObject } from "lodash";
import DateTimePicker from "@/components/DataInput/DateTimePicker";
import ObjectInput from "../DataInput/ObjectInput";
import { convertFSValue } from "@/utils/fieldConverter";
import ArrayInput from "../DataInput/ArrayInput";
import { useContextMenu } from "@/hooks/contextMenu";
import { actionRemoveFieldKey } from "@/atoms/firestore.action";

interface IEditableCell {
  row: ClientDocumentSnapshot;
  column: {
    id: string;
  };
  value: IValueType | IPrimitiveType;
  tabIndex: number;
  canChangeType?: boolean;
  toggleExpand: (boolean) => void;
}

export const EditablePropertyValue = ({
  row,
  column: { id },
  value: tableValue,
  tabIndex,
  canChangeType = true,
  toggleExpand,
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setFocused(true);
    if (e.key === "Escape") {
      setInstanceValue(value);
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

  const menuOptions = useMemo(() => {
    return FIELD_TYPES.map((fieldType) => ({
      title: fieldType,
      hint: fieldType,
      onClick: () => {
        const newValue = convertFSValue(instanceValue, fieldType);
        console.log({ newValue });
        setValue(newValue);
      },
    }));
  }, [instanceValue, setValue]);

  useContextMenu(
    "DELETE_PROPERTY_VALUE",
    () => {
      actionRemoveFieldKey(fieldPath);
    },
    fieldPath
  );

  const fieldType = useMemo(() => {
    return getFireStoreType(instanceValue);
  }, [instanceValue]);

  let defaultEditor = (
    <DataInput
      ref={inputEl}
      className={classNames("focus:ring-1 focus:ring-blue-400", {
        ["bg-red-300"]: isFieldChanged,
        ["bg-yellow-200 transition-colors duration-300"]: isHighlight,
      })}
      tabIndex={tabIndex}
      value={instanceValue}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );

  if (isObject(tableValue)) {
    switch (tableValue.type) {
      case "timestamp":
        defaultEditor = (
          <DateTimePicker value={instanceValue as any} onChange={onChange} />
        );
        break;
      case "map":
        defaultEditor = (
          <ObjectInput fieldPath={fieldPath} toggleExpand={toggleExpand} />
        );
        break;
      case "array":
        defaultEditor = (
          <ArrayInput fieldPath={fieldPath} toggleExpand={toggleExpand} />
        );
        break;
    }
  }

  return (
    <div
      className="relative w-full h-full outline-none"
      ref={wrapperEl}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      cm-template="propertyValue"
      cm-id={fieldPath}
    >
      <div
        className={classNames(
          "absolute z-20 opacity-0 top-0.5 right-0.5 hover:opacity-100 transition-opacity",
          {
            ["opacity-70"]: isHovered && !isFocused,
          }
        )}
      >
        {isHovered && (
          <DropdownMenu menu={menuOptions} isSmall disabled={!canChangeType}>
            <button
              role="button"
              className="p-1 text-xs text-red-700 bg-white border border-gray-300"
            >
              {fieldType}
            </button>
          </DropdownMenu>
        )}
      </div>
      {defaultEditor}
    </div>
  );
};

export default EditablePropertyValue;
