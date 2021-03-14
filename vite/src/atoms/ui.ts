import { atom, atomFamily, selector } from "recoil";
import { changedDocAtom, newDocsAtom } from "./firestore";
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
  default: "basic",
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
        resolve(true);
      }, Math.min(totalDocs * 10, 5000)); // Assumption parsing time of one doc is 50ms
    });
  },
});

export const isCommittableAtom = selector<boolean>({
  key: "ui/committable",
  get: ({ get }) => {
    const changedDocs = get(changedDocAtom);
    const newDocs = get(newDocsAtom);

    return changedDocs.length > 0 || newDocs.length > 0;
  },
});

export const newFieldAtom = atomFamily<string, string>({
  key: "ui/newField",
  default: "",
});
