import { configure } from "react-hotkeys";
import { loader } from "@monaco-editor/react";

/**
 * Config react-hotkeys
 */
configure({
  // logLevel: "debug",
  ignoreTags: ["select"],
});

loader.config({
  paths: {
    vs: "/vs",
  },
});

export default {};
