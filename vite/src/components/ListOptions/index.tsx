import React, { ReactElement, useEffect, useState } from "react";

interface IListOptionsProps {
  options: {
    element: ReactElement;
    key: string;
  }[];
  onChange: (string) => void;
  currentOption: string;
}

const ListOptions = ({
  options,
  onChange,
  currentOption,
}: IListOptionsProps): ReactElement => {
  useEffect(() => {
    if (currentOption) {
      const optionElement = document.querySelector(
        `[data-id='${currentOption}']`
      );
      if (optionElement) {
        optionElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [currentOption]);

  return (
    <ul className="overflow-y-auto max-h-96">
      {options.map((option) =>
        React.cloneElement(option.element, {
          key: option.key,
          isActive: currentOption === option?.key,
          onClickItem: onChange,
        })
      )}
    </ul>
  );
};

export default ListOptions;
