import React from "react";
import DataTable from "@/components/DataTable";
import Filters from "@/components/Filters";

function Main(): React.ReactElement {
  return (
    <div className="relative flex flex-col h-full">
      <Filters />
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataTable />
      </React.Suspense>
    </div>
  );
}

export default Main;
