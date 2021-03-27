import { GARDEN_PLACEMENT, TooltipModal } from "@zendeskgarden/react-modals";
import classNames from "classnames";
import { useSelect } from "downshift";
import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import ShortcutKey from "../ShortcutKey";

interface IDropdownMenuProps {
  children: React.ReactElement;
  className?: string;
  containerClassName?: string;
  placement?: string;
  isSmall?: boolean;
  disabled?: boolean;
  menu: {
    title: string;
    hotkey?: string | string[];
    hint?: string;
    onClick: () => void;
  }[];
}

function DropdownMenu({
  children,
  placement = "bottom-start",
  className,
  containerClassName,
  menu,
  disabled = false,
}: IDropdownMenuProps) {
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    toggleMenu,
  } = useSelect({
    items: menu,
    onSelectedItemChange: ({ selectedItem }) => selectedItem?.onClick(),
  });
  const childRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={className}>
      {React.cloneElement(
        children,
        getToggleButtonProps({ disabled, ref: childRef })
      )}
      {ReactDOM.createPortal(
        <TooltipModal
          referenceElement={isOpen ? childRef.current : null}
          onClose={() => toggleMenu()}
          placement={placement as GARDEN_PLACEMENT}
          className={classNames(
            "w-20 px-0 py-2 leading-normal shadow-lg",
            containerClassName
          )}
          restoreFocus={false}
          focusOnMount={false}
          hasArrow={false}
          isAnimated={false}
        >
          <ul {...getMenuProps()} className="outline-none">
            {menu.map((item, index) => (
              <li
                key={`${item.title}${index}`}
                {...getItemProps({ item, index })}
                className={classNames(
                  "cursor-pointer px-3 py-1 text-sm text-gray-700 flex flex-row justify-between items-center",
                  {
                    ["bg-gray-200"]: highlightedIndex === index,
                  }
                )}
              >
                <span>{item.title}</span>
                {/* <ShortcutKey hotkey={"Command+X"} /> */}
                {item.hotkey && (
                  <ShortcutKey hotkey={item.hotkey} size="small" />
                )}
              </li>
            ))}
          </ul>
        </TooltipModal>,
        document.getElementById("root-body") || document.body
      )}
    </div>
  );
}

export default DropdownMenu;
