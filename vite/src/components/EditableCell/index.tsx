import { buildFSUrl, fieldAtom, fieldChangedAtom } from "@/atoms/firestore";
import { navigatorPathAtom } from "@/atoms/navigator";
import { actionGoTo } from "@/atoms/navigator.action";
import { useContextMenu } from "@/hooks/contextMenu";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getPathEntities, isNumeric } from "@/utils/common";
import { getFireStoreType } from "@/utils/simplifr";
import { Checkbox, Field, Label } from "@zendeskgarden/react-forms";
import { Tooltip } from "@zendeskgarden/react-tooltips";
import classNames from "classnames";
import { DocRef } from "firestore-serializers/src/DocRef";
import { isEqual, isUndefined } from "lodash";
import { Textarea } from "@zendeskgarden/react-forms";
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import CopyIcon from "@/components/CopyIcon";
import DateTimePicker from "@/components/DataInput/DateTimePicker";

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
  const [instanceValue, setInstanceValue] = useState(value);
  const [isHighlight, toggleHighlight] = useState(false);
  const wrapperEl = useRef(null);
  const inputEl = useRef<HTMLTextAreaElement>(null);

  const fieldType = useMemo(() => {
    return getFireStoreType(instanceValue);
  }, [instanceValue]);

  const onChange = (newInstanceValue) => {
    if (fieldType === "number" && isNumeric(newInstanceValue)) {
      // Respect current type
      setInstanceValue(Number(newInstanceValue));
    } else {
      setInstanceValue(newInstanceValue);
    }
  };

  const onBlur = () => {
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
    if (!isUndefined(value) && !isEqual(instanceValue, value)) {
      // TODO: Check if value return is null, 0, ""
      setInstanceValue(value || "");
      toggleHight();
    }
  }, [value]);

  const handleClickFollowLink = (
    e: MouseEvent | null,
    link: string,
    isInternal = true
  ) => {
    if (e === null || e.ctrlKey || e.metaKey) {
      if (isInternal) {
        actionGoTo(link);
      } else {
        window.open(link, "_blank");
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setInstanceValue(value);
    }

    if (e.key === "Enter" && (e.shiftKey || e.altKey)) {
      setInstanceValue((curValue) => curValue + "\n");
      return;
    }

    // How about break line case?
    if (e.key === "Enter") {
      if (instanceValue !== value) {
        setValue(instanceValue);
      }
      e.preventDefault();
      return;
    }
  };

  // TODO: Add quick look for object type. It will open a modal showing what inside, user can see it but can not edit it

  const editorComponent = useMemo(() => {
    let defaultEditor: ReactElement = (
      <Textarea
        ref={inputEl}
        className={classNames(
          "w-full absolute bg-transparent overflow-hidden truncate h-full min-h-full outline-none ring-inset focus:bg-blue-100 p-1.5 pt-2 focus:ring-1 focus:ring-blue-400 focus:z-50 focus:shadow-lg",
          {
            ["text-right"]: fieldType === "number",
            ["h-focus-full-2"]: String(instanceValue).includes("\n"),
          }
        )}
        // isResizable={String(instanceValue).includes("\n")}
        isBare
        value={instanceValue as string}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
    );

    if (!isUndefined(instanceValue)) {
      switch (fieldType) {
        case "array":
          defaultEditor = (
            <div className="p-1.5 font-mono text-red-700">array</div>
          );
          break;
        case "map":
          defaultEditor = (
            <div className="p-1.5 font-mono text-red-700">map</div>
          );
          break;
        case "geopoint":
          defaultEditor = (
            <div className="p-1.5 font-mono text-red-700">geopoint</div>
          );
          break;
        case "timestamp":
          defaultEditor = (
            <DateTimePicker
              value={value as firebase.firestore.Timestamp}
              onChange={(newValue) => setValue(newValue)}
            />
          );
          break;
        case "boolean":
          defaultEditor = (
            <div className="p-1.5">
              <Field>
                <Checkbox
                  checked={value as boolean}
                  onChange={() => setValue(!value)}
                >
                  <Label hidden>{value ? "true" : "false"}</Label>
                </Checkbox>
              </Field>
            </div>
          );
          break;
        case "reference":
          const refValue = instanceValue as DocRef;
          defaultEditor = (
            <Tooltip
              placement="top-start"
              delayMS={100}
              hasArrow={false}
              size="medium"
              type="light"
              className="w-32"
              content={
                <span>
                  <a
                    className="text-blue-400 cursor-pointer"
                    onClick={() => handleClickFollowLink(null, refValue.path)}
                  >
                    Follow reference
                  </a>{" "}
                  (cmd + click)
                </span>
              }
            >
              <Textarea
                ref={inputEl}
                className={classNames(
                  "focus:ring-1 p-1.5 pt-2 bg-transparent break-all outline-none focus:ring-blue-400 h-full w-full truncate underline text-blue-400 focus:z-50 focus:shadow-lg",
                  {
                    ["bg-red-300"]: isFieldChanged,
                    ["bg-yellow-200 transition-colors duration-300"]: isHighlight,
                  }
                )}
                isBare
                onClick={(e) => handleClickFollowLink(e as any, refValue.path)}
                tabIndex={tabIndex}
                value={refValue.path}
                onChange={(e) => onChange(new DocRef(e.target.value))}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
              />
            </Tooltip>
          );
          break;
      }
    }

    return defaultEditor;
  }, [fieldType, instanceValue, onChange, setValue]);

  return (
    <div
      ref={wrapperEl}
      className={classNames("w-full h-full outline-none group relative", {
        ["bg-red-300"]: isFieldChanged,
        ["bg-yellow-200 transition-colors duration-300"]: isHighlight,
      })}
    >
      {editorComponent}
    </div>
  );
};

interface IIDReadonlyCell {
  value?: string;
  children?: ReactNode;
  isNew?: boolean;
}

export const IDReadOnlyField = ({
  value,
  children,
  isNew = false,
}: IIDReadonlyCell) => {
  const currentPath = useRecoilValue(navigatorPathAtom);
  const isActive = value === getPathEntities(currentPath).pop();

  if (children) {
    return <div className="w-full h-full px-px">{children}</div>;
  }

  return (
    <div className="relative w-full h-full px-px font-mono group">
      <input
        className={classNames(
          "focus:ring-1 focus:ring-blue-400 w-full h-full bg-transparent outline-none ring-inset focus:bg-blue-100 p-1.5 text-gray-800 font-mono text-sm",
          {
            ["pl-0.5 border-l-4 border-blue-400"]: isActive,
            ["bg-green-400"]: isNew,
          }
        )}
        value={value}
        readOnly
      />
      <CopyIcon
        value={value || ""}
        className="absolute w-6 transform -translate-y-1/2 bg-white opacity-0 cursor-pointer right-1 top-1/2 group-hover:opacity-100 p-0.5 rounded"
      />
    </div>
  );
};

export default EditableCell;
