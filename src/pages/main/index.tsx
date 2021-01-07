import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import Main from "./main";
import PathInput from "@/component/PathInput";

const ReactGridLayout = WidthProvider(RGL);

function MainLayout() {
  const layout = [
    { i: "nav-bar", x: 0, y: 0, w: 12, h: 1 },
    { i: "sidebar", x: 0, y: 0, w: 3, h: 2 },
    { i: "main", x: 3, y: 0, w: 7, h: 2 },
    { i: "property", x: 10, y: 0, w: 2, h: 2 },
  ];
  return (
    <ReactGridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={500}
      autoSize={true}
      margin={[16, 16]}
      isDraggable={false}
      isResizable={false}
    >
      <div key="nav-bar">
        <PathInput />
      </div>
      <div key="sidebar">Sidebar</div>
      <div key="main">
        <Main />
      </div>
      <div key="property">Property</div>
    </ReactGridLayout>
  );
}

export default MainLayout;
