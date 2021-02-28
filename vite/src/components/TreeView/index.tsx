import React, { useEffect, useRef, useState } from "react";
import * as immutable from "object-path-immutable";
import Tree from "rc-tree";
import "rc-tree/assets/index.css";
import { useRecoilState, useResetRecoilState } from "recoil";
import { navigatorPathAtom } from "@/atoms/navigator";
import { Input } from "@zendeskgarden/react-forms";

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
  const [data, setData] = useState<TreeNode[]>([]);
  const structTree = useRef({});

  const constructData = (data: any[]) => {
    const newObject = immutable.wrap(structTree.current);

    data.forEach((doc: any) => {
      newObject.merge(doc?.ref?.path.replaceAll("/", "."), {});
    });

    structTree.current = newObject.value();
    setData(buildTree(structTree.current, []));
  };

  useEffect(() => {
    const collections = path
      .split("/")
      .reduce((prev: string[], current: string) => {
        const lastPath = prev[prev.length - 1];
        return [...prev, [lastPath, current].join("/").replace("//", "/")];
      }, [])
      .filter((collection, index) => index % 2);
    const listeners = collections.map((collection) => {
      return window.listen(collection, (data: any[]) => constructData(data));
    });

    const ids = Promise.all(
      collections.map((collection) => {
        return window
          .send("fs.pathExplorer.subscribe", {
            topic: collection,
            path: collection,
          })
          .then((response) => {
            return response.id;
          }) as Promise<string>;
      })
    );

    return () => {
      listeners.forEach((listener) => listener());
      // Promise.all(
      //   ids.map((id: string) =>
      //     window.send("fs.unsubscribe", {
      //       id,
      //     })
      //   )
      // );
    };
  }, [path]);

  const handleSelectTree = (keys: React.ReactText[]) => {
    if (keys.length > 0) {
      setPath(keys[0] as string);
    }
  };

  return (
    <div>
      <Input placeholder="Search for item..." isCompact />
      <Tree showLine treeData={data} onSelect={handleSelectTree} height={500} />
    </div>
  );
}

export default TreeView;
