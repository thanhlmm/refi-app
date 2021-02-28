import { atom } from "recoil";

export const isShowPreviewChangeModal = atom<boolean>({
  key: "ui/previewChangeModal",
  default: false,
});
