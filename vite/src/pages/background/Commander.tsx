import { globalHotKeysHandler } from "@/atoms/hotkeys";
import { isModalCommandAtom } from "@/atoms/ui";
import EscExit from "@/components/EscExit";
import ListOptions from "@/components/ListOptions";
import ShortcutKey from "@/components/ShortcutKey";
import { useFocusJail } from "@zendeskgarden/container-focusjail";
import { Input } from "@zendeskgarden/react-forms";
import { Body as ModalBody, Modal } from "@zendeskgarden/react-modals";
import classNames from "classnames";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getApplicationKeyMap } from "react-hotkeys";
import { useRecoilState, useSetRecoilState } from "recoil";

interface ICommand {
  name: string;
  sequences: {
    sequence: string;
  }[];
  key: string;
}

const CommandOption = ({
  isActive,
  command,
  onClickItem,
}: {
  isActive?: boolean;
  command: ICommand;
  onClickItem?: (string) => void;
}) => (
  <a
    href="#"
    key={command.name}
    className={classNames(
      "flex flex-row justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900",
      { ["bg-gray-200"]: isActive }
    )}
    role="menuitem"
    onClick={(e) => {
      e.preventDefault();
      if (onClickItem) {
        onClickItem(command.key);
      }
    }}
    data-id={command.key}
  >
    {command.name}
    <span className="space-x-4">
      {command.sequences.map((data, index) => (
        <ShortcutKey key={index} hotkey={data.sequence} />
      ))}
    </span>
  </a>
);

const Commander = () => {
  const setShowModalCommand = useSetRecoilState(isModalCommandAtom);
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeOption, setActive] = useState<number>(1);

  const keyMap = getApplicationKeyMap();

  const filteredCommands = useMemo<ICommand[]>(() => {
    const keywordLowercase = keyword.toLowerCase();
    return Object.keys(keyMap)
      .map((key) => ({ ...keyMap[key], key }))
      .filter((command) => {
        return (
          command &&
          command?.name &&
          command?.name.toLowerCase().includes(keywordLowercase)
        );
      }) as any;
  }, [keyMap, keyword]);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
  }, []);

  const options = useMemo(() => {
    const filtered = filteredCommands.map((command) => ({
      element: <CommandOption command={command} />,
      key: command.key,
    }));

    return filtered;
  }, [filteredCommands]);

  const currentOption = useMemo(() => options[activeOption], [
    activeOption,
    options,
  ]);

  useEffect(() => {
    if (!currentOption) {
      setActive(1);
    }
  }, [currentOption]);

  const onSelectOption = useCallback((command) => {
    setShowModalCommand(false);
    if (globalHotKeysHandler[command]) {
      globalHotKeysHandler[command]();
    }
  }, []);

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    const maxOptionsIndex = options.length;
    switch (e.key) {
      case "ArrowUp":
        setActive((index) =>
          index === 0 ? maxOptionsIndex - 1 : (index - 1) % maxOptionsIndex
        );
        break;
      case "ArrowDown":
        setActive((index) => (index + 1) % maxOptionsIndex);
        break;
      case "Enter":
        onSelectOption(currentOption.key);
        break;
      case "Escape":
        setShowModalCommand(false);
        break;
    }
  };

  // TODO: Add a section for recent commands

  return (
    <div>
      <EscExit onExit={() => setShowModalCommand(false)}>
        <Modal
          isAnimated={false}
          isLarge
          focusOnMount
          backdropProps={{
            onClick: () => setShowModalCommand(false),
            className: "justify-center",
          }}
          isCentered={false}
        >
          <ModalBody className="p-3">
            <div
              className="py-1 mt-2 rounded"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <Input
                placeholder="Commit changes, preview changes,... anything in your head 🤓"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleInputKeyDown}
                ref={inputRef}
                autoFocus
                className="px-3 mb-1"
                tabIndex={1}
              />
              <ListOptions
                options={options}
                onChange={onSelectOption}
                currentOption={currentOption?.key || "general"}
              />
            </div>
          </ModalBody>
        </Modal>
      </EscExit>
    </div>
  );
};

export default Commander;
