import React, { useMemo, useRef } from "react";
import { navigatorPathAtom } from "@/atoms/navigator";
import { KeyboardEvent, ChangeEvent, useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { Input } from "@zendeskgarden/react-forms";
import { Tooltip } from "@zendeskgarden/react-tooltips";
import { Breadcrumb } from "@zendeskgarden/react-breadcrumbs";
import { Anchor } from "@zendeskgarden/react-buttons";
import { beautifyId, getCollectionPath, getPathEntities } from "@/utils/common";
import { Span } from "@zendeskgarden/react-typography";
import { viewModePathInputAtom } from "@/atoms/ui";
import { useCopyToClipboard } from "react-use";
import { actionGoTo } from "@/atoms/navigator.action";

function PathInput() {
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  const [isViewMode, toggleViewMode] = useRecoilState(viewModePathInputAtom);
  const [pathInput, setPathInput] = useState(path);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, copyToClipboard] = useCopyToClipboard();
  const [copyStatus, setCopyStatus] = useState(false);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setPathInput(e.target.value);
  };

  const handlePathChange = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPath(pathInput);
    }
  };

  useEffect(() => {
    setPathInput(path);
  }, [path]);

  useEffect(() => {
    if (!isViewMode) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isViewMode]);

  useEffect(() => {
    if (copyStatus) {
      setTimeout(() => {
        setCopyStatus(false);
      }, 1000);
    }
  }, [copyStatus]);

  const handleClickEntity = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    entity: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    actionGoTo(path.substring(0, path.indexOf(entity) + entity.length));
  };

  const PathViewer = useMemo(() => {
    let entities = getPathEntities(path);
    let currentEntity = entities.pop();
    if (["", "/"].includes(path)) {
      currentEntity = window.projectId;
    }

    if (entities.length > 8) {
      entities = [...entities.slice(0, 3), "...", ...entities.slice(-4)];
    }

    return (
      <Breadcrumb
        className="w-full pl-2 cursor-pointer"
        onClick={() => toggleViewMode(false)}
        key={getCollectionPath(path)}
      >
        {entities.map((entity, index) =>
          entity === "..." ? (
            <Span>{entity}</Span>
          ) : (
            <Anchor key={entity} onClick={(e) => handleClickEntity(e, entity)}>
              {entity}
            </Anchor>
          )
        )}

        <Span>{currentEntity}</Span>
      </Breadcrumb>
    );
  }, [path]);

  const handleCopy = () => {
    copyToClipboard(path);
    setCopyStatus(true);
  };

  return (
    <div className="relative flex flex-row items-center h-full bg-gray-300">
      {isViewMode ? (
        PathViewer
      ) : (
        <Input
          ref={inputRef}
          isCompact
          value={pathInput}
          onChange={handleChangeValue}
          onKeyDown={handlePathChange}
          className="pr-8"
          onBlur={() => toggleViewMode(true)}
        />
      )}
      <button
        onClick={handleCopy}
        className="absolute w-5 transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
      >
        {copyStatus ? (
          <svg
            className="text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default PathInput;
