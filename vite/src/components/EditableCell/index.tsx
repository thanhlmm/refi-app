import React, { useEffect, useState } from "react";
import { Input } from "@zendeskgarden/react-forms";
import styles from "./index.module.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  buildFSUrl,
  docAtom,
  fieldAtom,
  fieldChangedAtom,
} from "@/atoms/firestore";
import { NSFireStore } from "@/types/FS";
import classNames from "classnames";

interface IReadonlyCell {
  value: string;
}

interface IEditableCell {
  row: NSFireStore.IDocSnapshot;
  column: {
    id: string;
  };
}

const EditableCell = ({
  row,
  column: { id },
}: IEditableCell): React.ReactNode => {
  const fieldPath = buildFSUrl({ path: row.ref.path, field: id });
  const [value, setValue] = useRecoilState(fieldAtom(fieldPath));
  const isFieldChanged = useRecoilValue(fieldChangedAtom(fieldPath));
  const [isFocus, setFocus] = useState(false);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    // updateMyData(id, value, row);
    setFocus(false);
  };

  // If the initialValue is changed external, sync it up with our state
  // useEffect(() => {
  //   setValue(initialValue);
  // }, [initialValue]);

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
            }
          )}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
    );
  }

  return (
    <div onClick={onFocus} className={styles.editableCell}>
      {value}
    </div>
  );
};

export const ReadOnlyField = ({ value }: IReadonlyCell) => {
  return (
    <div className="w-full h-full px-px">
      <input
        className="focus:ring-1 focus:ring-blue-400 w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5"
        value={value}
      />
    </div>
  );
};

export default EditableCell;
