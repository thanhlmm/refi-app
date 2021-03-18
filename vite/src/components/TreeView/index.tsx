import {
  allDocsAtom,
  deletedDocsAtom,
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
  actionGoTo,
} from "@/atoms/navigator.action";
import AutoSizer from "react-virtualized-auto-sizer";
import { actionToggleImportModal, notifyErrorPromise } from "@/atoms/ui.action";
import { useContextMenu } from "@/hooks/contextMenu";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import {
  beautifyId,
  getParentPath,
  getRecursivePath,
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebounce } from "react-use";
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
  // const hasBeenModified = useRecoilValue(hasModifiedDocAtom(path));

  return (
    <span
      className={classNames({
        ["text-green-600"]: hasNewDoc,
        // ["text-blue-600"]: hasBeenModified,
        ["font-mono text-xs"]: !isCollection,
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
    className: "hover:bg-gray-200 cursor-pointer",
    props: {
      onClick: () => actionGoTo([parent, key].join("/")),
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
    const additionNodeParentPath = getParentPath(additionNode.key);
    const simplifiedParentPath =
      additionNodeParentPath === "/" ? "" : additionNodeParentPath;
    if (simplifiedParentPath === parent) {
      passAdditionNode = false;
      result.push(additionNode);
    }
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

interface ITreeViewProps {
  allDocs: ClientDocumentSnapshot[];
  deletedDocs: ClientDocumentSnapshot[];
  pathAvailable: string[];
}

function TreeView({ allDocs, deletedDocs, pathAvailable }: ITreeViewProps) {
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  // const allDocs = useRecoilValue(allDocsAtom);
  // const pathAvailable = useRecoilValue(pathExpanderAtom);
  const [searchInput, setSearchInput] = useState("");
  const treeWrapperRef = useRef<HTMLDivElement>(null);
  const [addingNewCollection, setAddNewCollection] = useState<{
    path: string;
    key: string;
  } | null>(null);
  const [expandedKeys, setExpanded] = useState<string[]>([]);

  const handleSelectTree = useCallback((keys: React.ReactText[]) => {
    if (keys.length > 0) {
      setPath(keys[0] as string);
    }
  }, []);

  const handleExpandData = useCallback(async (node: EventDataNode) => {
    window
      .send("fs.pathExpander", { path: prettifyPath(node.key.toString()) })
      .then((response: string[]) => {
        actionAddPathExpander(response);
      })
      .catch(notifyErrorPromise);

    return;
  }, []);

  const handleOnAddCollection = useCallback(
    (path: string | null): void => {
      setAddNewCollection(null);
    },
    [setAddNewCollection]
  );

  const allPaths = useMemo(() => {
    let paths = [
      ...pathAvailable,
      ...allDocs.map((doc) => doc.ref.path),
    ].filter((item) => !deletedDocs.find((doc) => doc.ref.path === item));

    if (searchInput) {
      paths = paths.filter((path) =>
        path.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    return paths;
  }, [pathAvailable, allDocs, deletedDocs, searchInput]);

  const treeData = useMemo(() => {
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
  }, [allPaths, addingNewCollection]);

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
      setExpanded((keys) => uniq([...keys, path]));
      handleAddCollection(path);
    },
    "tree"
  );

  useContextMenu(
    "IMPORT",
    ({ path }: { path: string }) => {
      actionToggleImportModal(path, true);
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
    { expanded = true, node }: { expanded: boolean; node: DataNode }
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
    setExpanded((keys) => uniq([...keys, ...getRecursivePath(path)]));
  }, [path]);

  const expandedKeysWithFilter = useMemo(() => {
    if (searchInput.length >= 3) {
      return uniq(
        allPaths.reduce(
          (prev, path) => {
            return [...prev, ...getRecursivePath(path)];
          },
          [...expandedKeys]
        )
      );
    }

    return expandedKeys;
  }, [expandedKeys, searchInput]);

  return (
    <div className="flex flex-col h-full">
      <Input
        placeholder="Search for item..."
        isCompact
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div
        className="flex flex-col h-full mt-2"
        tabIndex={1}
        ref={treeWrapperRef}
        onFocus={handleOnFocus}
      >
        <div className="flex h-8 flex-row items-center justify-between pl-1.5 bg-gray-300 border-b-2 border-gray-500">
          <span>{window.projectId}</span>

          <button
            className="w-6 p-1 hover:bg-gray-400"
            role="button"
            onClick={() => handleAddCollection("")}
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
        <div className="w-full h-full">
          <AutoSizer disableWidth>
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
                defaultExpandedKeys={[path]}
                selectedKeys={[path]}
                expandedKeys={expandedKeysWithFilter}
                onExpand={handleOnExpand}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}

const TreeViewDebouncer = () => {
  const allDocs = useRecoilValue(allDocsAtom);
  const deletedDocs = useRecoilValue(deletedDocsAtom);
  const pathAvailable = useRecoilValue(pathExpanderAtom);
  const [debouncedDocs, setDebouncedDocs] = useState<ClientDocumentSnapshot[]>(
    allDocs
  );
  const [debouncedDeletedDocs, setDebouncedDeletedDocs] = useState<
    ClientDocumentSnapshot[]
  >(deletedDocs);
  const [debouncedPathAvailable, setDebouncedPathAvailable] = useState<
    string[]
  >(pathAvailable);

  useDebounce(
    () => {
      setDebouncedDocs(allDocs);
      setDebouncedDeletedDocs(deletedDocs);
      setDebouncedPathAvailable(pathAvailable);
    },
    250,
    [allDocs, deletedDocs, pathAvailable]
  );

  return (
    <TreeView
      allDocs={debouncedDocs}
      deletedDocs={debouncedDeletedDocs}
      pathAvailable={debouncedPathAvailable}
    />
  );
};

export default TreeViewDebouncer;
