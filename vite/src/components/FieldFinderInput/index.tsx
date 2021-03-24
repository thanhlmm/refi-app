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
}

const FieldFinderInput = ({
  value = "",
  onChange,
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
      placeholder={placeholder}
    />
  );
};

export default FieldFinderInput;
