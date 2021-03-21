import React, { useEffect, useRef, useState } from "react";
import { useSelect } from "downshift";
import classNames from "classnames";

interface IDropdownMenuProps {
  children: React.ReactElement;
  className?: string;
  placement?: "left" | "right";
  isSmall?: boolean;
  disabled?: boolean;
  menu: {
    title: string;
    hint?: string;
    onClick: () => void;
  }[];
}

function DropdownMenu({
  children,
  placement = "right",
  className,
  menu,
  isSmall = false,
  disabled = false,
}: IDropdownMenuProps) {
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: menu,
    onSelectedItemChange: ({ selectedItem }) => selectedItem?.onClick(),
  });
  const [shouldBottom, setBottom] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef.current) {
      const elementPosition = menuRef.current?.getBoundingClientRect();
      if (window.innerHeight - elementPosition.top < 400) {
        setBottom(false);
      }
    }
  }, []);

  return (
    <div className={classNames(className, "relative")} ref={menuRef}>
      {React.cloneElement(children, getToggleButtonProps({ disabled }))}
      <ul
        {...getMenuProps()}
        className={classNames(
          "absolute w-32 z-30 opacity-0 pointer-events-none outline-none max-w-4xl p-0 bg-white shadow-lg border border-gray-300 rounded",
          {
            "left-0": placement === "left",
            "right-0": placement === "right",
            "opacity-100 pointer-events-auto": isOpen,
            "top-7": isSmall && shouldBottom,
            "top-9": isSmall && shouldBottom,
            "-bottom-7": isSmall && !shouldBottom,
            "-bottom-9": isSmall && !shouldBottom,
          }
        )}
      >
        {isOpen &&
          menu.map((item, index) => (
            <li
              key={`${item.title}${index}`}
              {...getItemProps({ item, index })}
              className={classNames(
                "cursor-pointer block px-3 py-1 text-sm text-gray-700",
                {
                  ["bg-blue-200"]: highlightedIndex === index,
                }
              )}
            >
              {item.title}
            </li>
          ))}
      </ul>
      {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
      {/* <div tabIndex={0} /> */}
    </div>
  );
}

export default DropdownMenu;
