import { allColumnsRecursiveAtom, propertyListAtom } from "@/atoms/navigator";
import { Input } from "@zendeskgarden/react-forms";
import React, { ChangeEvent, ReactElement, useMemo } from "react";
import Autosuggest from "react-autosuggest";
import { useRecoilValue } from "recoil";

const getSuggestionValue = (suggestion) => suggestion;

const renderSuggestion = (suggestion) => {
  return <div className="p-1 hover:bg-gray-200">{suggestion}</div>;
};

const dumpFnc = () => {};

const autoCompleteTheme = {
  container: "relative",
  suggestionsContainer: "absolute t-2 l-2 w-full ",
  suggestionsList: "bg-white border border-gray-300",
  suggestionHighlighted: "bg-gray-200",
};

interface IFieldFinderInputProps {
  collectionPath: string;
  value: string;
  onChange: (string) => void;
  inputRef?: HTMLInputElement;
}

const InputComponent = (inputProps: any) => {
  return <Input {...inputProps} isCompact />;
};

const FieldFinderInput = ({
  collectionPath,
  value = "",
  onChange,
  inputRef,
}: IFieldFinderInputProps): ReactElement => {
  const allColumnsRecursive = useRecoilValue(allColumnsRecursiveAtom);
  const propertyList = useRecoilValue(propertyListAtom(collectionPath));

  const inputProps = {
    placeholder: "Field path. Eg: name.firstName",
    name: "property",
    value,
    ref: inputRef,
    onChange: (e: ChangeEvent<HTMLInputElement>, { newValue }) =>
      onChange(e.target.value),
  };

  const suggestions = useMemo(() => {
    return allColumnsRecursive.filter(
      (column) =>
        column.toLowerCase().startsWith(value.toLowerCase()) &&
        !propertyList
          .map((property) => property.toLowerCase())
          .includes(value.toLowerCase())
    );
  }, [allColumnsRecursive, value]);

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={dumpFnc}
      onSuggestionsClearRequested={dumpFnc}
      onSuggestionSelected={(e, { suggestion }) => onChange(suggestion)}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      theme={autoCompleteTheme}
      focusInputOnSuggestionClick
      renderInputComponent={InputComponent}
    />
  );
};

export default FieldFinderInput;
