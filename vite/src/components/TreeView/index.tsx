import React, { useEffect, useMemo, useRef, useState } from "react";
import * as immutable from "object-path-immutable";
import Tree, { TreeNode } from "rc-tree";
import "./index.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { navigatorPathAtom } from "@/atoms/navigator";
import { Input } from "@zendeskgarden/react-forms";
import { allDocsAtom, pathExpanderAtom } from "@/atoms/firestore";
import { EventDataNode } from "rc-tree/lib/interface";
import { actionAddPathExpander } from "@/atoms/firestore.action";

interface TreeNode {
  key: string;
  title: string;
  children: TreeNode[];
  isCollection: boolean;
}

function buildTree(
  mapObj: Record<string, any>,
  result: TreeNode[],
  parent = "",
  isCollection = true
): TreeNode[] {
  result = Object.keys(mapObj).map((key) => ({
    key: [parent, key].join("/"),
    title: key,
    children: [],
    isCollection: isCollection,
    icon: (props) => {
      // console.log(props);
      return (
        <div className="w-4">
          {isCollection ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          ) : (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </div>
      );
    },
    switcherIcon({ expanded, isLeaf }: { expanded: boolean; isLeaf: boolean }) {
      if (!isCollection) {
        return null;
      }

      if (expanded) {
        return (
          <div className="w-3 pt-1">
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        );
      }

      return (
        <div className="w-3 pt-1">
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      );
    },
  }));

  Object.keys(mapObj).forEach((key) => {
    const parent = result.find((node: TreeNode) => node.title === key);
    if (parent) {
      parent.children = buildTree(mapObj[key], [], parent.key, !isCollection);
    }
  });

  return result;
}

function TreeView() {
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  const allDocs = useRecoilValue(allDocsAtom);
  const pathAvailable = useRecoilValue(pathExpanderAtom);
  const [searchInput, setSearchInput] = useState("");
  const treeWrapperRef = useRef<HTMLDivElement>(null);

  const constructData = (paths: string[]) => {
    const newObject = immutable.wrap({});

    paths.forEach((path) => {
      newObject.merge(path.replace("/", "").replaceAll("/", "."), {});
    });

    return buildTree(newObject.value(), []);
  };

  const handleSelectTree = (keys: React.ReactText[]) => {
    if (keys.length > 0) {
      setPath(keys[0] as string);
    }
  };

  const handleExpandData = async (node: EventDataNode) => {
    console.log(node);
    window
      .send("fs.pathExpander", { path: node.key })
      .then((response: string[]) => {
        actionAddPathExpander(response);
      });

    return;
  };

  const treeData = useMemo(() => {
    let allPaths = [...pathAvailable, ...allDocs.map((doc) => doc.ref.path)];

    if (searchInput) {
      allPaths = allPaths.filter((path) =>
        path.toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    return constructData(allPaths);
  }, [allDocs, pathAvailable, searchInput]);

  const handleOnFocus = () => {
    // TODO: Handle select active node when user select a node for keyboard interactive
    treeWrapperRef?.current?.querySelector("input")?.focus();
  };

  return (
    <div>
      <Input
        placeholder="Search for item..."
        isCompact
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div
        className="mt-2"
        tabIndex={1}
        ref={treeWrapperRef}
        onFocus={handleOnFocus}
      >
        <Tree
          tabIndex={2}
          showLine
          treeData={treeData}
          onSelect={handleSelectTree}
          height={500}
          loadData={handleExpandData}
          virtual
          focusable
        />
      </div>
    </div>
  );
}

export default TreeView;
