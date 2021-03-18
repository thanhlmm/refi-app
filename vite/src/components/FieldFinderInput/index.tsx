import { allColumnsRecursiveAtom, propertyListAtom } from "@/atoms/navigator";
import { Input } from "@zendeskgarden/react-forms";
import React, { ChangeEvent, ReactElement, useMemo } from "react";
import { useRecoilValue } from "recoil";
import InputComboBox from "../InputComboBox";

interface IFieldFinderInputProps {
  value: string;
  onChange: (string) => void;
  inputRef?: HTMLInputElement;
  placeholder?: string;
}

const FieldFinderInput = ({
  value = "",
  onChange,
  inputRef,
  placeholder,
}: IFieldFinderInputProps): ReactElement => {
  const allColumnsRecursive = useRecoilValue(allColumnsRecursiveAtom);

  return (
    <InputComboBox
      items={allColumnsRecursive}
      selectedItem={value}
      handleSelectedItemChange={onChange}
      inputRef={inputRef}
      placeholder={placeholder}
    />
  );
};

export default FieldFinderInput;
