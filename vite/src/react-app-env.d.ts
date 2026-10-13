/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
    readonly VITE_APP_VERSION: string;
  }
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
}

declare module "react-grid-layout";
declare module "react-window";

type WorkerRequests = import("refi-ipc").WorkerRequests;
type SendFuncType = <Name extends keyof WorkerRequests>(
  name: Name,
  ...args: WorkerRequests[Name]["args"] extends void
    ? []
    : [WorkerRequests[Name]["args"]]
) => Promise<WorkerRequests[Name]["result"]>;
type ListenFuncType = (name: string, cb: Function) => Function;

interface IContextMenu {
  clearRendererBindings: (actionName?: string, elementId?: string) => void;
  onReceive: <T>(
    actionName: string,
    cb: (T) => void,
    elementId?: string
  ) => void;
}

type NotificationFuncType = (
  type: "error" | "warning" | "success",
  message: string,
  showTime = 3000
) => void;

interface TabChangeList {
  tabs: string[];
  active: string;
}

interface Window {
  send: SendFuncType;
  listen: ListenFuncType;
  form: any; // DEBUG
  notification: NotificationFuncType;
  api: {
    contextMenu: IContextMenu;
    openUrl: (string) => void;
    webFrame: {
      setZoomFactor: (number) => void;
      getZoomFactor: () => number;
    };
    newTab: (url: string) => void;
    onTabChange: (cb: (data: TabChangeList) => void) => void;
    getTabs: () => Promise<TabChangeList>;
    setTab: (tab: string) => void;
    closeTab: (tab: string) => void;
    closeWindow: () => void;
    minimumWindow: () => void;
    toggleMaximumWindow: () => void;
    renameTab: (name: string) => void;
  };
  projectId: string;
  platform: string;
}
