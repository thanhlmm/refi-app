import { navigatorPathAtom } from "@/atoms/navigator";
import { actionGoTo } from "@/atoms/navigator.action";
import { viewModePathInputAtom } from "@/atoms/ui";
import CopyIcon from "@/components/CopyIcon";
import { getCollectionPath, getPathEntities } from "@/utils/common";
import { Breadcrumb } from "@zendeskgarden/react-breadcrumbs";
import { Anchor } from "@zendeskgarden/react-buttons";
import { Input } from "@zendeskgarden/react-forms";
import { Span } from "@zendeskgarden/react-typography";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRecoilState } from "recoil";

function PathInput() {
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  const [isViewMode, toggleViewMode] = useRecoilState(viewModePathInputAtom);
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
    if (!isViewMode) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isViewMode]);

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
      <CopyIcon
        value={path}
        className="absolute w-5 transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
      />
    </div>
  );
}

export default PathInput;
