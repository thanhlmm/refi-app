import React from "react";
import DataTable from "@/components/DataTable";
import { navigatorPath } from "@/atoms/navigator";
import { useRecoilState } from "recoil";

function Main() {
  const [path, setPath] = useRecoilState(navigatorPath);

  return (
    <div className="h-full p-2 border border-gray-300 rounded shadow-sm main ">
      <div>Filter here</div>
      <DataTable key={path} />
    </div>
  );
}

export default Main;
