import { docAtom, pathExpanderAtom } from "@/atoms/firestore";
import { navigatorPathAtom } from "@/atoms/navigator";
import { defaultEditorAtom } from "@/atoms/ui";
import { getListCollections } from "@/utils/common";
import { Anchor, Button } from "@zendeskgarden/react-buttons";
import { Input } from "@zendeskgarden/react-forms";
import React, { useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import MonacoProperty from "./MonacoProperty";
import PropertyTable from "./PropertyTable";

const Property = () => {
  const currentPath = useRecoilValue(navigatorPathAtom);
  const pathAvailable = useRecoilValue(pathExpanderAtom);
  const doc = useRecoilValue(docAtom(currentPath));
  const [searchInput, setSearchInput] = useState("");
  const [editorType, setEditorType] = useRecoilState(defaultEditorAtom);

  const listCollections = useMemo(() => {
    return getListCollections(currentPath, pathAvailable);
  }, [currentPath, pathAvailable]);

  if (!doc) {
    // TODO: Render last doc or select doc in collection
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <Input
        placeholder="Search for property or value..."
        isCompact
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div className="h-full max-h-full overflow-auto">
        <h3>Collections</h3>
        {listCollections.map((collection) => (
          <div className="block" key={collection}>
            <Anchor href={collection}>{collection}</Anchor>
          </div>
        ))}
        <h3>Fields</h3>
        <div className="flex flex-row justify-end">
          <Button
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
          </Button>
        </div>
        {editorType === "basic" && (
          <PropertyTable searchInput={searchInput} doc={doc} />
        )}
        {editorType === "advantage" && <MonacoProperty doc={doc} />}
      </div>
    </div>
  );
};

export default Property;
