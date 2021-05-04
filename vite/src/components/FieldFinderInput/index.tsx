import {
  allColumnsRecursiveAtom,
  navigatorCollectionPathAtom,
  propertyListAtom,
} from "@/atoms/navigator";
import { uniq } from "lodash";
import React, { ReactElement } from "react";
import { useRecoilValue } from "recoil";
import InputComboBox from "../InputComboBox";

interface IFieldFinderInputProps {
  value: string;
  onChange: (string) => void;
  inputRef?: HTMLInputElement;
  placeholder?: string;
  onSelect?: (string) => void;
}

const FieldFinderInput = ({
  value = "",
  onChange,
  onSelect,
  inputRef,
  placeholder,
}: IFieldFinderInputProps): ReactElement => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const allColumnsRecursive = useRecoilValue(allColumnsRecursiveAtom);
  const propertyList = useRecoilValue(propertyListAtom(collectionPath));

  const items = uniq([...allColumnsRecursive, ...propertyList]);

  return (
    <InputComboBox
      items={items}
      selectedItem={value}
      handleSelectedItemChange={onChange}
      inputRef={inputRef}
      onSelect={onSelect}
      placeholder={placeholder}
    />
  );
};

export default FieldFinderInput;
