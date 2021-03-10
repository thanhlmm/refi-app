import { Input } from "@zendeskgarden/react-forms";
import { useCombobox } from "downshift";
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
    <div className="relative">
      <div {...getComboboxProps()} className="relative">
        <Input
          {...getInputProps({
            onBlur: handleInputBlur,
          })}
          isCompact
        />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
          className="absolute transform -translate-y-1/2 top-1/2 right-1"
        >
          &#8595;
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className="absolute z-20 w-full overflow-y-auto bg-white top-10"
      >
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: "#bde4ff" } : {}
              }
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
              className="h-1.5"
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default InputComboBox;
