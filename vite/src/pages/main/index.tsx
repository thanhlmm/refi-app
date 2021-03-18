import { projectIdAtom } from "@/atoms/firestore";
import { actionAddPathExpander } from "@/atoms/firestore.action";
import { setRecoilExternalState } from "@/atoms/RecoilExternalStatePortal";
import { notifyErrorPromise } from "@/atoms/ui.action";
import DataSubscriber from "@/components/DataSubscriber";
import NavBar from "@/components/NavBar";
import ProductBar from "@/components/ProductBar";
import Property from "@/components/Property";
import TreeView from "@/components/TreeView";
import URLSynchronizer from "@/components/URLSynchronizer";
import { HeaderIcon } from "@zendeskgarden/react-dropdowns";
import React, { ReactElement, useEffect, useMemo } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { useParams } from "react-router-dom";
import { withSize } from "react-sizeme";
import Background from "../background";
import UniversalHotKey from "../hotkey";
import Main from "./main";

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
    // remainHeight = Screen height - Nav height - Footer height
    const remainHeight = size.height - (BASE_HEIGHT + BASE_SPACE * 2) - 16;

    // Height = BASE_HEIGHT*x + (x-1)*BASE_SPACE = BASE_HEIGHT*x + BASE_SPACE*X - BASE_SPACE. It's MATH
    const remainSpace =
      (remainHeight - BASE_SPACE) / (BASE_HEIGHT + BASE_SPACE);
    return [
      { i: "nav-bar", x: 0, y: 0, w: 12, h: 1 },
      {
        i: "sidebar",
        x: 0,
        y: 0,
        w: 2,
        h: remainSpace,
      },
      {
        i: "main",
        x: 2,
        y: 0,
        w: 7,
        h: remainSpace,
      },
      {
        i: "property",
        x: 10,
        y: 0,
        w: 3,
        h: remainSpace,
      },
    ];
  }, [size.height]);

  useEffect(() => {
    setRecoilExternalState(projectIdAtom, projectId);
    window
      .send("fs.init", { projectId })
      .then((response: string[]) => {
        console.log("Inited fs");
        actionAddPathExpander(response);
      })
      .catch(notifyErrorPromise);
  }, []);

  return (
    <div className="flex flex-col justify-between w-screen h-screen">
      <div>
        <UniversalHotKey />
        <DataSubscriber />
        <URLSynchronizer />
        {/* <RecoilSelector /> */}
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
      <div className="flex flex-row justify-end pr-3 text-white transform translate-y-1 bg-gray-400">
        <ProductBar />
      </div>
    </div>
  );
}

export default withSize({
  monitorWidth: false,
  monitorHeight: true,
  refreshRate: 50,
  refreshMode: "debounce",
})(MainLayout);
