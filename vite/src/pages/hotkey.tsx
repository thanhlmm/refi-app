import React from "react";
import { globalHotKeys, globalHotKeysHandler } from "@/atoms/hotkeys";
import { GlobalHotKeys } from "react-hotkeys";

const UniversalHotKey = () => {
  // TODO: Disable changes for optimize perf
  return (
    <GlobalHotKeys
      keyMap={globalHotKeys as any}
      handlers={globalHotKeysHandler}
      allowChanges={true}
    />
  );
};

export default UniversalHotKey;
