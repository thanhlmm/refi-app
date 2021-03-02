import { atom } from "recoil";

export const isShowPreviewChangeModalAtom = atom<boolean>({
  key: "ui/previewChangeModal",
  default: false,
});

export const isShowDocFinderModalCommandAtom = atom<boolean>({
  key: "ui/docFinderModal",
  default: true,
});
