import { TooltipModal } from "@zendeskgarden/react-modals";
import React, { useRef, useState } from "react";

interface IDropdownMenuProps {
  children: React.ReactElement;
  menu: {
    title: string;
    hint: string;
    isSelected?: boolean;
    onClick: (e) => void;
  }[];
}

const DropdownMenu = ({
  children,
  menu,
}: IDropdownMenuProps): React.ReactElement => {
  const childrenRef = useRef(null);
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLButtonElement | null>();

  return (
    <div>
      <div>
        {React.cloneElement(children, {
          ref: childrenRef,
          onClick: () => {
            setReferenceElement(childrenRef.current);
          },
        })}
      </div>
      <TooltipModal
        referenceElement={referenceElement}
        onClose={() => setReferenceElement(null)}
        // hasArrow={false}
        isAnimated={false}
        placement="bottom-start"
        className="w-40 max-w-4xl p-0 bg-white rounded shadow-lg ring-black ring-opacity-5"
      >
        <div
          className="py-1"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {menu.map((menuItem) => (
            <a
              href="#"
              key={menuItem.title}
              className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              role="menuitem"
            >
              {menuItem.title}
            </a>
          ))}
        </div>
      </TooltipModal>
    </div>
  );
};

export default DropdownMenu;
