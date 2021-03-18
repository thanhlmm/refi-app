import { Input } from "@zendeskgarden/react-forms";
import { useCombobox } from "downshift";
import React, { ReactElement, useState } from "react";
import classNames from "classnames";

interface IInputComboBoxProps<T> {
  inputRef?: HTMLInputElement;
  items: T[];
  selectedItem: T;
  handleSelectedItemChange: (T) => void;
  placeholder?: string;
}

const InputComboBox = ({
  items,
  selectedItem,
  handleSelectedItemChange,
  inputRef,
  placeholder,
}: IInputComboBoxProps<string>): ReactElement => {
  const [inputItems, setInputItems] = useState(items);
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    selectedItem,
    onSelectedItemChange: ({ selectedItem }) => {
      return handleSelectedItemChange(selectedItem);
    },
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        items.filter((item) =>
          inputValue
            ? item.toLowerCase().startsWith(inputValue.toLowerCase())
            : true
        )
      );
      handleSelectedItemChange(inputValue);
    },
  });

  return (
    <div className="relative">
      <div {...getComboboxProps()} className="relative">
        <Input
          {...getInputProps()}
          ref={inputRef}
          placeholder={placeholder}
          isCompact
        />
      </div>
      {isOpen && (
        <ul
          {...getMenuProps()}
          className={classNames(
            "absolute z-20 opacity-0 pointer-events-none max-w-md min-w-full overflow-y-auto bg-white border border-gray-300 shadow-md max-h-64 top-8",
            {
              "opacity-100 pointer-events-auto": isOpen,
            }
          )}
        >
          {inputItems.map((item, index) => (
            <li
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
              className={classNames("h-7 p-1 truncate", {
                ["bg-blue-200"]: highlightedIndex === index,
              })}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InputComboBox;
