import React, { ReactElement, useEffect, useMemo } from "react";
import RGL, { WidthProvider, Responsive } from "react-grid-layout";
import Main from "./main";
import PathInput from "@/components/PathInput";
import TreeView from "@/components/TreeView";
import { withSize } from "react-sizeme";

import { useParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Background from "./background";
import Property from "@/components/Property/index.tsx";
import { useSetRecoilState } from "recoil";
import { actionAddPathExpander, pathExpanderAtom } from "@/atoms/firestore";

const ReactGridLayout = WidthProvider(RGL);

interface IMainLayoutProps {
  size: {
    width: number;
    height: number;
  };
}

const BASE_HEIGHT = 32;
const BASE_SPACE = 16;

function MainLayout({ size }: IMainLayoutProps): ReactElement {
  const { projectId } = useParams() as any;
  const layout = useMemo(() => {
    const remainHeight = Math.ceil(size.height / BASE_HEIGHT);
    const remainSpace = Math.ceil(
      ((remainHeight + 1) * BASE_SPACE) / BASE_HEIGHT
    );

    // console.log({ remainHeight, remainSpace });
    return [
      { i: "nav-bar", x: 0, y: 0, w: 12, h: 1 },
      {
        i: "sidebar",
        x: 0,
        y: 0,
        w: 2,
        h: 18,
      },
      {
        i: "main",
        x: 2,
        y: 0,
        w: 7,
        h: 18,
      },
      {
        i: "property",
        x: 10,
        y: 0,
        w: 3,
        h: 18,
      },
    ];
  }, [size]);

  useEffect(() => {
    window.send("fs.init", { projectId }).then((response: string[]) => {
      console.log("Inited fs");
      actionAddPathExpander(response);
    });
  }, []);

  return (
    <div className="w-screen h-screen">
      <ReactGridLayout
        className="transition-none layout"
        layout={layout}
        cols={12}
        rowHeight={BASE_HEIGHT}
        autoSize={true}
        margin={[BASE_SPACE, BASE_SPACE]}
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

export default withSize({ monitorWidth: true, monitorHeight: true })(
  MainLayout
);
