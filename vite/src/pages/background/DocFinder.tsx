import { allDocsAtom } from "@/atoms/firestore";
import { isShowDocFinderModalCommandAtom } from "@/atoms/ui";
import { Input } from "@zendeskgarden/react-forms";
import { Body as ModalBody, Modal } from "@zendeskgarden/react-modals";
import React, { useEffect, useMemo, useState } from "react";
import { HotKeys, withHotKeys } from "react-hotkeys";
import { useRecoilState, useRecoilValue } from "recoil";

const KEYMAP = {
  CLOSE_MODAL: "Escape",
};

const DocFinder = () => {
  const [
    isShowDocFinderModalCommand,
    setShowDocFinderModalCommand,
  ] = useRecoilState(isShowDocFinderModalCommandAtom);
  const [keyword, setKeyword] = useState("");
  const allDocs = useRecoilValue(allDocsAtom);

  const filteredDocs = useMemo(() => {
    const keywordLowercase = keyword.toLowerCase();
    if (keywordLowercase.length >= 2) {
      return allDocs.filter((doc) => {
        return doc.ref.path.toLowerCase().includes(keywordLowercase);
      });
    }
    // TODO: Show recent search result
    return [];
  }, [allDocs, keyword]);

  useEffect(() => {
    if (!isShowDocFinderModalCommand) {
      setKeyword("");
    }
  }, [isShowDocFinderModalCommand]);

  // TODO: Focus on input once modal mount
  // TODO: Reset keyword when unmount
  // TODO: Lazy get all docs

  return (
    <div>
      {isShowDocFinderModalCommand && (
        <Modal
          isAnimated={false}
          isLarge
          focusOnMount
          backdropProps={{
            onClick: () => setShowDocFinderModalCommand(false),
            className: "justify-center",
          }}
          isCentered={false}
        >
          <HotKeys
            keyMap={KEYMAP}
            handlers={{
              CLOSE_MODAL: () => setShowDocFinderModalCommand(false),
            }}
            allowChanges
          >
            <ModalBody className="p-3">
              <Input
                placeholder="Search documents, collections by path, id"
                tabIndex={1}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <div
                className="py-1 mt-2 rounded"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                {filteredDocs.map((doc) => (
                  <a
                    href="#"
                    key={doc.id}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                    role="menuitem"
                  >
                    {doc.id} <span>{doc.ref.path}</span>
                  </a>
                ))}
              </div>
            </ModalBody>
          </HotKeys>
        </Modal>
      )}
    </div>
  );
};

export default DocFinder;
