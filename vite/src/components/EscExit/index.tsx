import React, { ReactElement, useMemo } from "react";
import { HotKeys } from "react-hotkeys";

const KEYMAP = {
  CLOSE: "Escape",
};

interface IEscExit {
  onExit: (params?: any) => void;
  data?: any;
  children: ReactElement;
}

const EscExit = ({ onExit, data, children }: IEscExit): ReactElement => {
  const handler = useMemo(() => {
    return {
      CLOSE: () => {
        onExit(data);
      },
    };
  }, [onExit, data]);

  return (
    <HotKeys keyMap={KEYMAP} handlers={handler} allowChanges>
      {children}
    </HotKeys>
  );
};

export default EscExit;
