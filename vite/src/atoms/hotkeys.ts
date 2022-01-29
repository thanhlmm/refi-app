import { getSampleColumn, isCollection, mapHotKeys } from "@/utils/common";
import { collectionWithQueryAtom } from "./firestore";
import {
  actionCommitChange,
  actionDuplicateDoc,
  actionNewDocument,
} from "./firestore.action";
import { navigatorCollectionPathAtom, navigatorPathAtom } from "./navigator";
import {
  actionExportDocCSV,
  actionExportDocJSON,
  actionExportViewCSV,
  actionExportViewJSON,
  actionQueryPage,
  actionSetProperty,
  actionSubmitQuery,
} from "./navigator.action";
import {
  getRecoilExternalLoadable,
  setRecoilExternalState,
} from "./RecoilExternalStatePortal";
import {
  isModalCommandAtom,
  isModalFeedbackAtom,
  isModalNewsAtom,
  isShowPreviewChangeModalAtom,
  viewModePathInputAtom,
} from "./ui";
import { actionToggleImportModal } from "./ui.action";

export type IGlobalHotKeys = Record<
  string,
  {
    name: string;
    group: "navigator" | "action" | "general";
    sequences: string | string[];
    handler: (event: any) => void;
  }
>;

export const globalHotKeys: IGlobalHotKeys = {
  OPEN_PATH_INPUT: {
    name: "Go to documents, collections by path",
    group: "navigator",
    sequences: mapHotKeys("command+p"),
    handler: () => setRecoilExternalState(viewModePathInputAtom, false),
  },
  OPEN_COMMAND_LIST: {
    name: "Open command list",
    group: "navigator",
    sequences: mapHotKeys(["command+shift+p", "command+/"]),
    handler: () =>
      setRecoilExternalState(isModalCommandAtom, (value) => !value),
  },
  COMMIT_CHANGES: {
    name: "Commit changes",
    group: "action",
    sequences: mapHotKeys("command+s"),
    handler: async () => {
      await actionCommitChange();
    },
  },
  PREVIEW_CHANGES: {
    name: "Preview changes",
    group: "action",
    sequences: mapHotKeys("command+shift+s"), // TODO: Check the right key
    handler: () => {
      setRecoilExternalState(isShowPreviewChangeModalAtom, (value) => !value);
    },
  },
  REVERT_CHANGES: {
    name: "Refresh - Revert uncommitted changes",
    group: "action",
    sequences: mapHotKeys("command+r"),
    handler: () => {
      // actionReverseChange();
    },
  },
  WHATS_NEWS: {
    name: "What's news",
    group: "general",
    sequences: mapHotKeys(""),
    handler: () => {
      setRecoilExternalState(isModalNewsAtom, (value) => !value);
    },
  },
  LEAVE_FEEDBACK: {
    name: "Leave Feedback",
    group: "general",
    sequences: mapHotKeys(""),
    handler: () => {
      setRecoilExternalState(isModalFeedbackAtom, (value) => !value);
    },
  },
  SEND_QUERY: {
    name: "Query",
    group: "action",
    sequences: mapHotKeys("command+Enter"),
    handler: () => {
      actionSubmitQuery(true);
    },
  },
  SEND_QUERY_NEXT: {
    name: "Query next page",
    group: "action",
    sequences: mapHotKeys("command+]"),
    handler: () => {
      actionQueryPage(true);
    },
  },
  SEND_QUERY_PREVIOUS: {
    name: "Query previous page",
    group: "action",
    sequences: mapHotKeys("command+["),
    handler: () => {
      actionQueryPage(false);
    },
  },
  SEND_QUERY_WITHOUT_FILTER: {
    name: "Query without filter",
    group: "action",
    sequences: mapHotKeys("command+shift+Enter"),
    handler: () => {
      actionSubmitQuery(false);
    },
  },
  RESET_PROPERTY: {
    name: "Reset property columns",
    group: "action",
    sequences: mapHotKeys(""),
    handler: async () => {
      const collectionPath = await getRecoilExternalLoadable(
        navigatorCollectionPathAtom
      ).toPromise();
      const data = await getRecoilExternalLoadable(
        collectionWithQueryAtom(collectionPath)
      ).toPromise();

      actionSetProperty(collectionPath, getSampleColumn(data));
    },
  },
  EXPORT_QUERY_JSON: {
    name: "Export: Current table as JSON",
    group: "action",
    sequences: mapHotKeys("command+e"),
    handler: () => {
      actionExportViewJSON();
    },
  },
  EXPORT_QUERY_CSV: {
    name: "Export: Current table as CSV",
    group: "action",
    sequences: mapHotKeys("command+shift+e"),
    handler: () => {
      actionExportViewCSV();
    },
  },
  EXPORT_DOC_JSON: {
    name: "Export: Current document as JSON",
    group: "action",
    sequences: mapHotKeys(""),
    handler: async () => {
      const docPath = await getRecoilExternalLoadable(
        navigatorPathAtom
      ).toPromise();
      if (isCollection(docPath)) {
        // TODO: Show error
        return;
      }

      actionExportDocJSON(docPath);
    },
  },
  EXPORT_DOC_CSV: {
    name: "Export: Current document as CSV",
    group: "action",
    sequences: mapHotKeys(""),
    handler: async () => {
      const docPath = await getRecoilExternalLoadable(
        navigatorPathAtom
      ).toPromise();
      if (isCollection(docPath)) {
        // TODO: Show error
        return;
      }

      actionExportDocCSV(docPath);
    },
  },
  DUPLICATE_DOC: {
    name: "Duplicate current document",
    group: "action",
    sequences: mapHotKeys("command+d"),
    handler: async () => {
      const docPath = await getRecoilExternalLoadable(
        navigatorPathAtom
      ).toPromise();

      if (isCollection(docPath)) {
        // TODO: Show error
        return;
      }

      actionDuplicateDoc(docPath);
    },
  },
  IMPORT_DATA: {
    name: "Import data",
    group: "action",
    sequences: mapHotKeys("command+i"),
    handler: async () => {
      const collectionPath = await getRecoilExternalLoadable(
        navigatorCollectionPathAtom
      ).toPromise();
      actionToggleImportModal(collectionPath);
    },
  },
  NEW_DOCUMENT: {
    name: "New document",
    group: "action",
    sequences: mapHotKeys("command+n"),
    handler: async () => {
      const collectionPath = await getRecoilExternalLoadable(
        navigatorCollectionPathAtom
      ).toPromise();
      actionNewDocument(collectionPath);
    },
  },
  ZOOM_IN: {
    name: "Zoom in / Increase font size",
    group: "action",
    sequences: mapHotKeys("command+Add"),
    handler: () => {
      window.api.webFrame.setZoomFactor(
        window.api.webFrame.getZoomFactor() + 0.1
      );
    },
  },
  ZOOM_OUT: {
    name: "Zoom out / Decrease font size",
    group: "action",
    sequences: mapHotKeys("command+Subtract"),
    handler: () => {
      window.api.webFrame.setZoomFactor(
        window.api.webFrame.getZoomFactor() - 0.1
      );
    },
  },
  NEW_TAB: {
    name: "New Tab",
    group: "action",
    sequences: mapHotKeys(""),
    handler: () => {
      window.api.newTab(window.location.href);
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
