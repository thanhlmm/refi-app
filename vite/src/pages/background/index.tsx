import React from "react";
import ImportModal from "@/components/ImportModal";
import Commander from "./Commander";
import DocFinder from "./DocFinder";
import PreviewChanges from "./PreviewChanges";

const Background = () => {
  return (
    <>
      <PreviewChanges />
      <DocFinder />
      <Commander />
      <ImportModal />
    </>
  );
};

export default Background;
