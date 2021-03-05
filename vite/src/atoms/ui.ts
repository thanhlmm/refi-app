import { atom, atomFamily } from "recoil";

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
