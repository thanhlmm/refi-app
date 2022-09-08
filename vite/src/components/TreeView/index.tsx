import {
  allDocsAtom,
  deletedDocsAtom,
  docAtom,
  pathExpanderAtom,
} from "@/atoms/firestore";
import {
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
  actionPathExpand,
} from "@/atoms/navigator.action";
import { actionToggleImportModal } from "@/atoms/ui.action";
import { useContextMenu } from "@/hooks/contextMenu";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import {
  beautifyId,
  getParentPath,
  getProjectId,
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
import AutoSizer from "react-virtualized-auto-sizer";
import { useRecoilState, useRecoilValue } from "recoil";
import "./index.css";

interface IFSDataNode extends DataNode {
  isCollection: boolean;
  key: string;
  path: string;
  name: string;
}

const NodeComponent = ({ path, name, isCollection }: IFSDataNode) => {
  const doc = useRecoilValue(docAtom(path));

  return (
    <span
      className={classNames("dark:text-gray-100", {
        ["text-green-600"]: doc?.isNew,
        ["text-blue-600"]: doc?.isChanged(),
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
  result = Object.keys(mapObj)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      key: [parent, key].join("/"),
      path: [parent, key].join("/"),
      name: key,
      title: (props) => <NodeComponent {...props} />,
      children: [],
      isCollection: isCollection,
      className:
        "hover:bg-gray-200 cursor-pointer dark:hover:bg-gray-800 dark:text-white",
      props: {
        onClick: (e) => {
          if (e.target?.getAttribute("role") !== "expander") {
            // Ignore if user click on the expander icon
            actionGoTo([parent, key].join("/"));
          }
        },
        "cm-template": isCollection
          ? "treeCollectionContext"
          : "treeDocContext",
        "cm-payload-path": [parent, key].join("/"),
        "cm-id": "tree",
      },
      icon: ({ expanded }: { expanded: boolean }) => {
        return (
          <div className="w-5">
            {isCollection ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM6 3v10h1V3H6zm3.171.345l.299-.641 1.88-.684.64.299 3.762 10.336-.299.641-1.879.684-.64-.299L9.17 3.345zm1.11.128l3.42 9.396.94-.341-3.42-9.397-.94.342zM1 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM2 3v10h1V3H2z"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8zm-3-9V2l3 3h-3z"
                />
              </svg>
            )}
          </div>
        );
      },
      switcherIcon({
        expanded,
        isLeaf,
      }: {
        expanded: boolean;
        isLeaf: boolean;
      }) {
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
              role="expander"
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
            role="expander"
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
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM6 3v10h1V3H6zm3.171.345l.299-.641 1.88-.684.64.299 3.762 10.336-.299.641-1.879.684-.64-.299L9.17 3.345zm1.11.128l3.42 9.396.94-.341-3.42-9.397-.94.342zM1 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM2 3v10h1V3H2z"
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
    actionPathExpand(node.key.toString());
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
        className="dark:bg-gray-900"
      />
      <div
        className="flex flex-col h-full mt-2"
        tabIndex={1}
        ref={treeWrapperRef}
        onFocus={handleOnFocus}
      >
        <div className="flex h-8 flex-row items-center justify-between pl-1.5 bg-gray-200 dark:bg-gray-900 border-b-2 border-gray-400">
          <span>{getProjectId()}</span>

          <button
            className="h-full px-1.5 hover:bg-gray-400"
            role="button"
            onClick={() => handleAddCollection("")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.5 2H7.71l-.85-.85L6.51 1h-5l-.5.5v11l.5.5H7v-1H1.99V6h4.49l.35-.15.86-.86H14v1.5l-.001.51h1.011V2.5L14.5 2zm-.51 2h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99zM13 16h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"
              />
            </svg>
          </button>
        </div>
        <div className="w-full h-full dark:bg-gray-900">
          <AutoSizer disableWidth>
            {({ height }) => (
              <Tree
                // showLine
                treeData={treeData as any}
                onSelect={handleSelectTree}
                loadData={handleExpandData}
                height={height}
                itemHeight={30}
                virtual
                focusable
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
