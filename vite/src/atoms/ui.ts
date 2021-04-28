import { atom, atomFamily, DefaultValue, selector } from "recoil";
import { changedDocAtom, deletedDocsAtom, newDocsAtom } from "./firestore";
import { userPersistAtom } from "./persistAtom";

export const isShowPreviewChangeModalAtom = atom<boolean>({
  key: "ui/previewChangeModal",
  default: false,
});

export const isShowDocFinderModalCommandAtom = atom<boolean>({
  key: "ui/docFinderModal",
  default: false,
});

export const isModalCommandAtom = atom<boolean>({
  key: "ui/docCommandModal",
  default: false,
});

export const isModalNewsAtom = atom<boolean>({
  key: "ui/newsModal",
  default:
    Number(localStorage.getItem("version")) <
    Number(import.meta.env.VITE_APP_VERSION),
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((newValue) => {
        if (!newValue) {
          localStorage.setItem(
            "version",
            import.meta.env.VITE_APP_VERSION as string
          );
        }
      });
    },
  ],
});

export const isModalFeedbackAtom = atom<boolean>({
  key: "ui/feedbackModal",
  default: false,
});

export const isModalPickProperty = atom<boolean>({
  key: "ui/propertyList",
  default: false,
});

export const isModalSorter = atom<boolean>({
  key: "ui/sorterList",
  default: false,
});

export const isImportModalAtom = atom<boolean>({
  key: "ui/importModal",
  default: false,
});

export const importFileAtom = atom<File | undefined>({
  key: "ui/importFile",
  default: undefined,
});

export const defaultEditorAtom = atom<"basic" | "advantage">({
  key: "ui/defaultEditor",
  default: "advantage",
  effects_UNSTABLE: [userPersistAtom],
});

interface IParsingLargeDataAtom {
  totalDocs: number;
}

export const isParsingLargeDataAtom = atom<IParsingLargeDataAtom>({
  key: "ui/isParsingLargeData",
  default: { totalDocs: 0 },
});

export const largeDataAtom = selector({
  key: "ui/deferRender",
  get: ({ get }) => {
    const { totalDocs } = get(isParsingLargeDataAtom);
    return new Promise((resolve) => {
      setTimeout(() => {
        requestAnimationFrame(() => {
          resolve(true);
        });
      }, 100);
    });
  },
});

export const isCommittableAtom = selector<boolean>({
  key: "ui/committable",
  get: ({ get }) => {
    const changedDocs = get(changedDocAtom);
    const newDocs = get(newDocsAtom);
    const deletedDocs = get(deletedDocsAtom);

    return (
      changedDocs.length > 0 || newDocs.length > 0 || deletedDocs.length > 0
    );
  },
});

export const newFieldAtom = atomFamily<string, string>({
  key: "ui/newField",
  default: "",
});

export const viewModePathInputAtom = atom({
  key: "ui/pathInputView",
  default: true,
});

export const monacoDataErrorAtom = atomFamily<string, string>({
  key: "ui/monacoDataError",
  default: () => "",
});

export const importCollectionPathAtom = atom<string>({
  key: "ui/importCollectionPath",
  default: "",
});

interface INotificationMessages {
  id: string;
  type: "error" | "warning" | "success";
  message: string;
  showTime: number;
}

export const notifierAtom = atom<INotificationMessages[]>({
  key: "ui/notifier",
  default: [],
  effects_UNSTABLE: [
    ({ onSet, setSelf }) => {
      onSet((newNotification) => {
        if (newNotification instanceof DefaultValue) {
          return;
        }
        const latestNotification = [...newNotification].pop();
        if (latestNotification) {
          setTimeout(() => {
            setSelf((list) => {
              if (Array.isArray(list)) {
                return list.filter((list) => list.id !== latestNotification.id);
              }
              return list;
            });
          }, latestNotification.showTime);
        }

        return;
      });
    },
  ],
});

export const dummyAtom = atom({
  key: "ui/dummy",
  default: null,
});

export const emulatorProjectId = atom({
  key: "ui/emulator-project",
  default: "example-project",
  effects_UNSTABLE: [userPersistAtom],
});

export const emulatorConnection = atom({
  key: "ui/emulator-connection",
  default: "localhost:8080",
  effects_UNSTABLE: [userPersistAtom],
});

export const isModalPricingAtom = atom<boolean>({
  key: "ui/modal-pricing",
  default: false,
});
