import { actionCommitChange } from "./firestore.action";
import { setRecoilExternalState } from "./RecoilExternalStatePortal";
import {
  isModalCommandAtom,
  isModalFeedbackAtom,
  isModalNewsAtom,
  isShowDocFinderModalCommandAtom,
  isShowPreviewChangeModalAtom,
} from "./ui";

export type IGlobalHotKeys = Record<
  string,
  {
    name: string;
    group: "navigator" | "action" | "general";
    sequences: string;
    handler: () => void;
  }
>;

export const globalHotKeys: IGlobalHotKeys = {
  // OPEN_DOC_SEARCH: {
  //   name: "Search documents, collections by name",
  //   group: "navigator",
  //   sequences: "command+p",
  // },
  OPEN_COMMAND_LIST: {
    name: "Open command list",
    group: "navigator",
    sequences: "command+shift+p",
    handler: () =>
      setRecoilExternalState(isModalCommandAtom, (value) => !value),
  },
  COMMIT_CHANGES: {
    name: "Commit changes",
    group: "action",
    sequences: "command+s",
    handler: async () => {
      await actionCommitChange();
    },
  },
  PREVIEW_CHANGES: {
    name: "Preview changes",
    group: "action",
    sequences: "command+shift+s", // TODO: Check the right key
    handler: () => {
      setRecoilExternalState(isShowPreviewChangeModalAtom, (value) => !value);
    },
  },
  WHATS_NEWS: {
    name: "What's news",
    group: "general",
    sequences: "",
    handler: () => {
      setRecoilExternalState(isModalNewsAtom, (value) => !value);
    },
  },
  LEAVE_FEEDBACK: {
    name: "Leave Feedback",
    group: "general",
    sequences: "",
    handler: () => {
      setRecoilExternalState(isModalFeedbackAtom, (value) => !value);
    },
  },
  SEND_QUERY: {
    name: "Query",
    group: "action",
    sequences: "command+Enter",
    handler: () => {
      // TODO: Send the query
    },
  },
};

type IGlobalHotKeysHandler = Record<string, () => void>;

export const globalHotKeysHandler: IGlobalHotKeysHandler = Object.keys(
  globalHotKeys
).reduce((handlers, action) => {
  handlers[action] = globalHotKeys[action].handler;
  return handlers;
}, {});
