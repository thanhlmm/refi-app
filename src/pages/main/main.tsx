import React from "react";
import PathInput from "@/components/PathInput";
import DataTable from "@/components/DataTable";

function Main() {
  return (
    <div className="h-full p-2 border border-gray-300 rounded shadow-sm main ">
      <div>Filter here</div>
      <DataTable />
    </div>
  );
}

export default Main;
