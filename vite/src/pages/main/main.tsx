import React from "react";
import DataTable from "@/components/DataTable";
import Filters from "@/components/Filters";

function Main(): React.ReactElement {
  return (
    <div className="h-full p-2 border border-gray-300 rounded shadow-sm main ">
      <div>
        <Filters />
      </div>
      <DataTable />
    </div>
  );
}

export default Main;
