import React, { ReactElement, useEffect } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import Main from "./main";
import PathInput from "@/components/PathInput";
import TreeView from "@/components/TreeView";

import { useParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Background from "./background";
import Property from "@/components/Property";
import { useSetRecoilState } from "recoil";
import { actionAddPathExpander, pathExpanderAtom } from "@/atoms/firestore";

const ReactGridLayout = WidthProvider(RGL);

function MainLayout(): ReactElement {
  const { projectId } = useParams() as any;
  const layout = [
    { i: "nav-bar", x: 0, y: 0, w: 12, h: 1 },
    { i: "sidebar", x: 0, y: 0, w: 3, h: 8 },
    { i: "main", x: 3, y: 0, w: 7, h: 8 },
    { i: "property", x: 10, y: 0, w: 2, h: 8 },
  ];

  useEffect(() => {
    window.send("fs.init", { projectId }).then((response: string[]) => {
      console.log("Inited fs");
      actionAddPathExpander(response);
    });
  }, []);

  return (
    <div>
      <ReactGridLayout
        className="transition-none layout"
        layout={layout}
        cols={12}
        rowHeight={64}
        autoSize={true}
        margin={[16, 16]}
        isDraggable={false}
        isResizable={false}
      >
        <div key="nav-bar">
          <NavBar />
        </div>
        <div key="sidebar">
          <TreeView />
        </div>
        <div key="main">
          <Main />
        </div>
        <div key="property">
          <Property />
        </div>
      </ReactGridLayout>
      <Background />
    </div>
  );
}

export default MainLayout;
