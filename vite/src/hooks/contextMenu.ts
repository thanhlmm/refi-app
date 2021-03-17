import { useEffect } from "react";

export const useContextMenu = <T>(
  actionId: string,
  cb: (arg: T) => void,
  elementId?: string
): void => {
  useEffect(() => {
    window.api.contextMenu.onReceive(
      actionId,
      function (args) {
        cb(args.attributes);
      }.bind(this),
      elementId
    );

    return () => {
      window.api.contextMenu.clearRendererBindings(actionId, elementId);
    };
  }, []);
};
