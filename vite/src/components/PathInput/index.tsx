import React, { useMemo, useRef } from "react";
import { navigatorPathAtom } from "@/atoms/navigator";
import { KeyboardEvent, ChangeEvent, useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { Input } from "@zendeskgarden/react-forms";
import { Tooltip } from "@zendeskgarden/react-tooltips";
import { Breadcrumb } from "@zendeskgarden/react-breadcrumbs";
import { Anchor } from "@zendeskgarden/react-buttons";
import { getPathEntities } from "@/utils/common";
import { Span } from "@zendeskgarden/react-typography";

function PathInput() {
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  const [isViewMode, toggleViewMode] = useState(true);
  const [pathInput, setPathInput] = useState(path);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (isViewMode) {
      inputRef.current?.focus();
    }
  }, [isViewMode]);

  const PathViewer = useMemo(() => {
    const entities = getPathEntities(path);
    const currentEntity = entities.pop();
    return (
      <Breadcrumb
        className="w-full pl-2 cursor-pointer"
        onClick={() => toggleViewMode(false)}
      >
        {entities.map((entity) => (
          <Anchor key={entity}>{entity}</Anchor>
        ))}

        <Span>{currentEntity}</Span>
      </Breadcrumb>
    );
  }, [path]);

  return (
    <div className="relative flex flex-row items-center h-full bg-gray-300 rounded-sm">
      {isViewMode ? (
        PathViewer
      ) : (
        <Input
          ref={inputRef}
          isCompact
          value={pathInput}
          onChange={handleChangeValue}
          onKeyDown={handlePathChange}
          onBlur={() => toggleViewMode(true)}
        />
      )}
      <Tooltip content="Copy" delayMS={150}>
        <div className="absolute w-5 transform -translate-y-1/2 cursor-pointer right-2 top-1/2">
          <svg
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
        </div>
      </Tooltip>
    </div>
  );
}

export default PathInput;
