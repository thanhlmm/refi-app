import { Input } from "@zendeskgarden/react-forms";
import classNames from "classnames";
import { useCombobox } from "downshift";
import React, { ReactElement, useMemo, useRef, useState } from "react";

interface ISelectComboBoxProps<T> {
  items: T[];
  selectedItem: T;
  handleSelectedItemChange: (T) => void;
  className?: string;
}

const SelectComboBox = ({
  items,
  selectedItem,
  handleSelectedItemChange,
  className,
}: ISelectComboBoxProps<string>): ReactElement => {
  const [inputValue, setInputText] = useState<string>(selectedItem);
  const inputWrapperRef = useRef(null);
  const menuRef = useRef(null);

  const inputItems = useMemo(() => {
    if (items.includes(inputValue)) {
      return items;
    }

    return items.filter((item) =>
      inputValue
        ? item.toLowerCase().startsWith(inputValue.toLowerCase())
        : true
    );
  }, [items, inputValue, selectedItem]);

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    // selectedItem,
    inputValue,
    onSelectedItemChange: ({ selectedItem }) => {
      setInputText(selectedItem || "");
    },
    onInputValueChange: ({ inputValue }) => {
      setInputText(inputValue || "");
      if (inputValue && items.includes(inputValue)) {
        handleSelectedItemChange(inputValue);
      }
    },
  });

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!items.includes(e.target.value)) {
      setInputText(selectedItem || "");
    }
  };

  return (
    <div className={className}>
      <div {...getComboboxProps()} className="relative">
        <Input
          {...getInputProps({
            onBlur: handleInputBlur,
            ref: inputWrapperRef,
            className: "pr-4 truncate",
          })}
          isCompact
        />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
          className="absolute transform -translate-y-1/2 top-1/2 right-1"
        >
          <svg
            className="w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      <ul
        {...getMenuProps({ ref: menuRef, style: { minWidth: "100px" } })}
        className={classNames(
          "absolute z-20 opacity-0 pointer-events-none max-w-md w-auto overflow-y-auto bg-white border border-gray-300 shadow-md max-h-64 top-8",
          {
            "opacity-100 pointer-events-auto": isOpen,
          }
        )}
      >
        {inputItems.map((item, index) => (
          <li
            key={`${item}${index}`}
            {...getItemProps({ item, index })}
            className={classNames("h-7 p-1 truncate cursor-pointer", {
              ["bg-blue-200"]: highlightedIndex === index,
            })}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectComboBox;
