import {
  allDocsAtom,
  hasBeenDeleteAtom,
  hasNewDocAtom,
  pathExpanderAtom,
} from "@/atoms/firestore";
import {
  actionAddPathExpander,
  actionDeleteCollection,
  actionDeleteDoc,
  actionNewDocument,
} from "@/atoms/firestore.action";
import { navigatorPathAtom } from "@/atoms/navigator";
import {
  actionExportCollectionCSV,
  actionExportCollectionJSON,
  actionExportDocCSV,
  actionExportDocJSON,
} from "@/atoms/navigator.action";
import { useContextMenu } from "@/hooks/contextMenu";
import {
  beautifyId,
  getParentPath,
  getPathEntities,
  isCollection,
  prettifyPath,
} from "@/utils/common";
import { COLLECTION_PREFIX } from "@/utils/contant";
import { Input } from "@zendeskgarden/react-forms";
import classNames from "classnames";
import { uniq, uniqueId } from "lodash";
import * as immutable from "object-path-immutable";
import Tree from "rc-tree";
import { DataNode, EventDataNode } from "rc-tree/lib/interface";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import "./index.css";

interface IFSDataNode extends DataNode {
  isCollection: boolean;
  key: string;
  path: string;
  name: string;
}

// TODO: Optimize me
const NodeComponent = ({ path, name, isCollection }: IFSDataNode) => {
  const hasNewDoc = useRecoilValue(hasNewDocAtom(path));
  const hasBeenDeleted = useRecoilValue(hasBeenDeleteAtom(path));

  return (
    <span
      className={classNames({
        ["bg-red-300"]: hasNewDoc,
        ["bg-purple-700"]: hasBeenDeleted,
      })}
    >
      {isCollection ? name : beautifyId(name)}
    </span>
  );
};

const constructData = (paths: string[], additionNode: IFSDataNode | null) => {
  const newObject = immutable.wrap({});

  paths.forEach((path) => {
    newObject.merge(path.replace("/", "").replaceAll("/", "."), {});
  });

  return buildTree(newObject.value(), [], "", true, additionNode);
};

function buildTree(
  mapObj: Record<string, any>,
  result: IFSDataNode[],
  parent = "",
  isCollection = true,
  additionNode: IFSDataNode | null
): IFSDataNode[] {
  result = Object.keys(mapObj).map((key) => ({
    key: [parent, key].join("/"),
    path: [parent, key].join("/"),
    name: key,
    title: (props) => <NodeComponent {...props} />,
    children: [],
    isCollection: isCollection,
    props: {
      "cm-template": isCollection ? "treeCollectionContext" : "treeDocContext",
      "cm-payload-path": [parent, key].join("/"),
      "cm-id": "tree",
    },
    icon: () => {
      return (
        <div className="w-4">
          {isCollection ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ccm-template="treeCollectionContext"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-3 pt-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      }

      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-3 pt-0.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      );
    },
  }));

  let passAdditionNode = true;
  if (additionNode) {
    console.log("compare", parent, "and", additionNode.key);
  }
  if (additionNode && getParentPath(additionNode.key) === parent) {
    passAdditionNode = false;
    result.push(additionNode);
  }

  Object.keys(mapObj).forEach((key) => {
    const parent = result.find((node: IFSDataNode) => node.name === key);
    if (parent) {
      parent.children = buildTree(
        mapObj[key],
        [],
        parent.key,
        !isCollection,
        passAdditionNode ? additionNode : null
      ).sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  return result;
}

interface INewCollectionInputProps {
  path: string;
  onChange: (path: string | null) => void;
}
const NewCollectionInput = ({ path, onChange }: INewCollectionInputProps) => {
  // TODO: Validate the path user has input https://firebase.google.com/docs/firestore/quotas?authuser=0
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateCollection = () => {
    if (!inputRef?.current?.value) {
      onChange(null);
      return;
    }

    const newPath = prettifyPath(
      `${path === "/" ? "" : path}/${inputRef?.current?.value}`
    );
    actionNewDocument(newPath);
    onChange(newPath);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onChange(null);
    }

    if (e.key === "Enter") {
      handleCreateCollection();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFocus: React.FocusEventHandler = (e) => {
    e.stopPropagation();
  };

  return (
    <input
      onKeyDown={onKeyDown}
      onBlur={() => handleCreateCollection()}
      ref={inputRef}
      tabIndex={2}
      onFocus={handleFocus}
      className="w-auto p-0.5 min-h border border-gray-300 h-6 focus:border-blue-400 text-sm outline-none"
    />
  );
};

const addNewCollectionNode = (
  path: string,
  key: string,
  cb: (path: string | null) => void
): IFSDataNode => {
  console.log({ path, key });
  return {
    key: [path, key].join("/"),
    title: () => <NewCollectionInput path={path} onChange={cb} />,
    path: [path, key].join("/"),
    name: key,
    children: [],
    isLeaf: true,
    isCollection: true,
    selectable: false,
    icon: () => {
      return (
        <div className="w-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ccm-template="treeCollectionContext"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      );
    },
    switcherIcon: () => null,
  };
};

function TreeView() {
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  const allDocs = useRecoilValue(allDocsAtom);
  const pathAvailable = useRecoilValue(pathExpanderAtom);
  const [searchInput, setSearchInput] = useState("");
  const treeWrapperRef = useRef<HTMLDivElement>(null);
  const [addingNewCollection, setAddNewCollection] = useState<{
    path: string;
    key: string;
  } | null>(null);
  const [expandedKeys, setExpanded] = useState<string[]>([]);

  const handleSelectTree = (keys: React.ReactText[]) => {
    if (keys.length > 0) {
      setPath(keys[0] as string);
    }
  };

  const handleExpandData = async (node: EventDataNode) => {
    if (
      addingNewCollection &&
      node.key.toString().endsWith(addingNewCollection.key)
    ) {
      return;
    }

    window
      .send("fs.pathExpander", { path: prettifyPath(node.key.toString()) })
      .then((response: string[]) => {
        actionAddPathExpander(response);
      });

    return;
  };

  const handleOnAddCollection = (path: string | null): void => {
    setAddNewCollection(null);
  };

  const treeData = useMemo(() => {
    let allPaths = [...pathAvailable, ...allDocs.map((doc) => doc.ref.path)];

    if (searchInput) {
      allPaths = allPaths.filter((path) =>
        path.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    const currentTree = constructData(
      allPaths,
      addingNewCollection
        ? addNewCollectionNode(
            addingNewCollection.path,
            addingNewCollection.key,
            handleOnAddCollection
          )
        : null
    );

    return currentTree;
  }, [allDocs, pathAvailable, searchInput, addingNewCollection]);

  const handleOnFocus = () => {
    treeWrapperRef?.current?.querySelector("input")?.focus();
  };

  const handleAddCollection = (path = "") => {
    setAddNewCollection({
      path,
      key: uniqueId(COLLECTION_PREFIX),
    });
  };

  useContextMenu(
    "EXPORT_CSV",
    ({ path }: { path: string }) => {
      if (isCollection(path)) {
        actionExportCollectionCSV(path);
      } else {
        actionExportDocCSV(path);
      }
    },
    "tree"
  );

  useContextMenu(
    "EXPORT_JSON",
    ({ path }: { path: string }) => {
      if (isCollection(path)) {
        actionExportCollectionJSON(path);
      } else {
        actionExportDocJSON(path);
      }
    },
    "tree"
  );

  useContextMenu(
    "NEW_DOC",
    ({ path }: { path: string }) => {
      actionNewDocument(path);
    },
    "tree"
  );

  useContextMenu(
    "NEW_COLLECTION",
    ({ path }: { path: string }) => {
      // TODO: Try to expand the tree
      console.log(path);
      handleAddCollection(path);
    },
    "tree"
  );

  useContextMenu(
    "DELETE",
    ({ path }: { path: string }) => {
      console.log("delete", path);
      if (isCollection(path)) {
        actionDeleteCollection(path);
      } else {
        actionDeleteDoc(path);
      }
    },
    "tree"
  );

  const handleOnExpand = (
    expandedKeys: any[],
    { expanded, node }: { expanded: boolean; node: DataNode }
  ) => {
    if (!expanded) {
      setExpanded((keys) =>
        keys.filter((key) => !key.startsWith(node.key.toString()))
      );
      return;
    }
    setExpanded(expandedKeys as string[]);
  };

  useEffect(() => {
    // const entities = getPathEntities(path);
    // console.log(entities);
    setExpanded((keys) => uniq([...keys, path]));
  }, [path]);

  return (
    <div className="flex flex-col h-full">
      <Input
        placeholder="Search for item..."
        isCompact
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div
        className="h-full mt-2"
        tabIndex={1}
        ref={treeWrapperRef}
        onFocus={handleOnFocus}
      >
        <div className="flex flex-row items-center justify-between px-1.5 bg-gray-300 border-b-2 border-gray-500">
          <span>refi_client</span>

          <button
            className="w-5 p-0.5"
            role="button"
            onClick={() => handleAddCollection("/")}
          >
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
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </button>
        </div>
        <Tree
          showLine
          treeData={treeData as any}
          onSelect={handleSelectTree}
          height={800}
          loadData={handleExpandData}
          virtual
          focusable
          itemHeight={24}
          className="h-full"
          autoExpandParent={true}
          defaultExpandedKeys={[path]}
          selectedKeys={[path]}
          expandedKeys={expandedKeys}
          onExpand={handleOnExpand}
        />
        {/* <AutoSizer disableWidth>
          {({ height }) => (
            <Tree
              showLine
              treeData={treeData as any}
              onSelect={handleSelectTree}
              height={height}
              loadData={handleExpandData}
              virtual
              focusable
              itemHeight={24}
              className="h-full"
              selectedKeys={selectedKeys}
            />
          )}
        </AutoSizer> */}
      </div>
    </div>
  );
}

export default TreeView;
