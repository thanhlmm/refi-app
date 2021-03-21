import React, { ReactElement, useEffect, useState } from "react";
import { HotKeys } from "react-hotkeys";

const keyMap = {
  UP: "up",
  DOWN: "down",
  ENTER: "enter",
  ESC: "Escape",
};

interface IListOptionsProps {
  options: {
    element: ReactElement;
    key: string;
  }[];
  onChange: (string) => void;
  onExit: () => void;
  startItem?: number;
}

const ListOptions = ({
  options,
  onChange,
  onExit,
  startItem = -1,
}: IListOptionsProps): ReactElement => {
  const [activeOption, setActive] = useState<number>(startItem);
  const maxOptionsIndex = options.length - 1;

  const currentOption = options[activeOption];

  const handler = {
    UP: () => {
      setActive((index) => (index - 1) % maxOptionsIndex);
    },
    DOWN: () => {
      setActive((index) => (index + 1) % maxOptionsIndex);
    },
    ENTER: () => {
      onChange(options[activeOption]?.key);
    },
    ESC: () => {
      onExit();
    },
  };

  useEffect(() => {
    if (!currentOption) {
      setActive(1);
    }
  }, [currentOption]);

  return (
    <HotKeys keyMap={keyMap} handlers={handler} allowChanges>
      <ul>
        {options.map((option) =>
          React.cloneElement(option.element, {
            key: option.key,
            isActive: currentOption?.key === option?.key,
            onClickItem: onChange,
          })
        )}
      </ul>
    </HotKeys>
  );
};

export default ListOptions;
