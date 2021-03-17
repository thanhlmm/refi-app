import {
  isImportModalAtom,
  isModalCommandAtom,
  isShowPreviewChangeModalAtom,
} from "@/atoms/ui";
import ImportModal from "@/components/ImportModal";
import React from "react";
import { useRecoilValue } from "recoil";
import Commander from "./Commander";
import PreviewChanges from "./PreviewChanges";

const Background = () => {
  const isShowChangeModal = useRecoilValue(isShowPreviewChangeModalAtom);
  const isShowModalCommand = useRecoilValue(isModalCommandAtom);
  const isShowImportModal = useRecoilValue(isImportModalAtom);

  return (
    <>
      {isShowChangeModal && <PreviewChanges />}
      {isShowModalCommand && <Commander />}
      {isShowImportModal && <ImportModal />}
    </>
  );
};

export default Background;
