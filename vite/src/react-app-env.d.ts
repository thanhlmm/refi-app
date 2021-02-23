/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
  }
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
}

declare module "react-grid-layout";
declare module "recoil-persist";
declare module "react-window";

type SendFuncType = (name: string, args: any) => Promise<any>;
type ListenFuncType = (name: string, cb: Function) => Function;

interface Window {
  send: SendFuncType;
  listen: ListenFuncType;
  form: any; // DEBUG
}
