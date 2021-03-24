import { docAtom } from "@/atoms/firestore";
import { actionNewDocument } from "@/atoms/firestore.action";
import { navigatorPathAtom } from "@/atoms/navigator";
import { actionGoTo } from "@/atoms/navigator.action";
import {
  resetRecoilExternalState,
  setRecoilExternalState,
} from "@/atoms/RecoilExternalStatePortal";
import { defaultEditorAtom } from "@/atoms/ui";
import { getPathEntities, isCollection } from "@/utils/common";
import { Button } from "@zendeskgarden/react-buttons";
import { Input, InputGroup } from "@zendeskgarden/react-forms";
import { Tooltip } from "@zendeskgarden/react-tooltips";
import classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import EmptyBox from "./EmptyBox.png";
import MonacoProperty from "./MonacoProperty";
import PropertyTable from "./PropertyTable";

const Property = () => {
  const currentPath = useRecoilValue(navigatorPathAtom);
  const doc = useRecoilValue(docAtom(currentPath));
  const [searchInput, setSearchInput] = useState("");
  const [editorType, setEditorType] = useRecoilState(defaultEditorAtom);
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleCreateDocument = useCallback(() => {
    if (isCollection(currentPath)) {
      actionNewDocument(currentPath);
      return;
    }

    const paths = getPathEntities(currentPath);
    const newId = paths.pop() || "newId";
    actionNewDocument(paths.join("/"), newId);
    return;
  }, [currentPath]);

  useEffect(() => {
    if (doc && idInputRef.current) {
      idInputRef.current.value = doc.id;
    }
  }, [doc?.id]);

  if (!doc) {
    if (currentPath === "/") {
      return null;
    }

    if (isCollection(currentPath)) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full">
          {/* <div className="w-1/4">
            <img src={Launching} />
          </div> */}
          <h2 className="mt-4">
            Click document on the table to start editing or
          </h2>
          <Button
            size="small"
            className="mt-3"
            onClick={handleCreateDocument}
            isPrimary
          >
            New Document
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="w-1/4">
          <img src={EmptyBox} />
        </div>
        <h2 className="mt-4">Opps...The document is not exist</h2>
        <Button
          size="small"
          className="mt-3"
          onClick={handleCreateDocument}
          isPrimary
        >
          Create
        </Button>
      </div>
    );
  }

  const onIdKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!idInputRef.current) {
      return;
    }
    if (e.key === "Escape") {
      idInputRef.current.value = doc.id;
      return;
    }

    if (e.key === "Enter") {
      handleOnChangeId(idInputRef.current.value);
      return;
    }
  };

  const handleOnChangeId = (id: string) => {
    if (id === doc.id) {
      return;
    }
    const newDoc = doc.clone(undefined, id);
    const letOldPath = currentPath;
    setRecoilExternalState(docAtom(newDoc.ref.path), newDoc);
    actionGoTo(newDoc.ref.path);
    resetRecoilExternalState(docAtom(letOldPath));
  };

  return (
    <div className="flex flex-col h-full">
      <div>
        <InputGroup isCompact>
          <div
            className={classNames(
              "w-8 p-1 text-center text-gray-700 border font-bold",
              {
                ["border-gray-200"]: !doc.isNew,
                ["border-gray-300"]: doc.isNew,
              }
            )}
          >
            _id
          </div>
          <Input
            ref={idInputRef}
            isCompact
            className="font-mono disabled:text-gray-700 disabled:border-gray-200"
            placeholder="Document id"
            defaultValue={doc.id}
            disabled={!doc.isNew}
            onBlur={(e) => handleOnChangeId(e.target.value)}
            onKeyDown={onIdKeyDown}
          />
        </InputGroup>
      </div>
      <div className="flex flex-row items-center justify-between mt-3">
        {editorType === "basic" ? (
          <Input
            placeholder="Search for property or value..."
            isCompact
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        ) : (
          <Tooltip
            placement="top-start"
            delayMS={100}
            hasArrow={false}
            size="medium"
            type="light"
            className="max-w-2xl"
            appendToNode={document.body}
            zIndex={40}
            content={
              <span>
                Type <code className="text-red-700 bg-gray-100 p-0.5">/</code>{" "}
                to start insert new type
              </span>
            }
          >
            <a className="text-xs text-blue-500 cursor-pointer">
              <svg
                className="inline-block w-4 mb-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>{" "}
              How to insert Timestamp, Geopoint or Reference?
            </a>
          </Tooltip>
        )}
        <div className="flex flex-row justify-self-end">
          {/* <Button
            size="small"
            onClick={() => setEditorType("basic")}
            isPrimary={editorType === "basic"}
            className="px-1.5"
          >
            <svg
              className="w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </Button>
          <Button
            size="small"
            onClick={() => setEditorType("advantage")}
            isPrimary={editorType === "advantage"}
            className="px-1.5"
          >
            <svg
              className="w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </Button> */}
        </div>
      </div>
      <div className="h-full max-h-full mt-2 overflow-auto">
        {editorType === "basic" && (
          <PropertyTable searchInput={searchInput} doc={doc} />
        )}
        {editorType === "advantage" && <MonacoProperty doc={doc} />}
      </div>
    </div>
  );
};

export default Property;
