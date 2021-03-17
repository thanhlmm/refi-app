import { globalHotKeysHandler } from "@/atoms/hotkeys";
import { isModalCommandAtom } from "@/atoms/ui";
import EscExit from "@/components/EscExit";
import ListOptions from "@/components/ListOptions";
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
      "flex flex-row justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-300 hover:text-gray-900",
      { ["bg-gray-200"]: isActive }
    )}
    role="menuitem"
    onClick={(e) => {
      e.preventDefault();
      if (onClickItem) {
        onClickItem(command.key);
      }
    }}
  >
    {command.name}{" "}
    <span>{command.sequences.map((data) => data.sequence).join(";")}</span>
  </a>
);

const Commander = () => {
  const setShowModalCommand = useSetRecoilState(isModalCommandAtom);
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

    return [
      {
        element: (
          <Input
            placeholder="Commit changes, preview changes,... anything in your head 🤓"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            ref={inputRef}
            autoFocus
            className="px-3"
            tabIndex={1}
          />
        ),
        key: "general",
      },
      ...filtered,
    ];
  }, [filteredCommands]);

  const onSelectOption = useCallback((command) => {
    setShowModalCommand(false);
    if (globalHotKeysHandler[command]) {
      globalHotKeysHandler[command]();
    }
  }, []);

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
              <ListOptions
                options={options}
                onChange={onSelectOption}
                onExit={() => setShowModalCommand(false)}
                startItem={0}
              />
            </div>
          </ModalBody>
        </Modal>
      </EscExit>
    </div>
  );
};

export default Commander;
