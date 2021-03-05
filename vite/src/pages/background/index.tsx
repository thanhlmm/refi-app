import React from "react";
import Commander from "./Commander";
import DocFinder from "./DocFinder";
import PreviewChanges from "./PreviewChanges";

const Background = () => {
  return (
    <>
      <PreviewChanges />
      <DocFinder />
      <Commander />
    </>
  );
};

export default Background;
