import { useCombobox, useSelect } from "downshift";
import React, { ReactElement, useState } from "react";

interface IInputComboBoxProps<T> {
  items: T[];
  selectedItem: T;
  handleSelectedItemChange: (T) => void;
}

const InputComboBox = ({
  items,
  selectedItem,
  handleSelectedItemChange,
}: IInputComboBoxProps<string>): ReactElement => {
  const [inputItems, setInputItems] = useState(items);
  const [inputValue, setInputText] = useState<string>(selectedItem);
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
    selectedItem,
    inputValue,
    onSelectedItemChange: ({ selectedItem }) => {
      return handleSelectedItemChange(selectedItem);
    },
    onInputValueChange: ({ inputValue }: { inputValue: string }) => {
      setInputItems(
        items.filter((item) =>
          item.toLowerCase().startsWith(inputValue.toLowerCase())
        )
      );
      setInputText(inputValue || "");
    },
  });

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!items.includes(e.target.value)) {
      setInputText(selectedItem || "");
    }
  };

  return (
    <div>
      <div {...getComboboxProps()}>
        <input
          {...getInputProps({
            onBlur: handleInputBlur,
            className: "p-1.5 w-full text-sm border-gray-300 border",
          })}
        />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
        >
          &#8595;
        </button>
      </div>
      <ul {...getMenuProps()}>
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: "#bde4ff" } : {}
              }
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default InputComboBox;
