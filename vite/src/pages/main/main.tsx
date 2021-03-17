import React from "react";
import DataTable from "@/components/DataTable";
import Filters from "@/components/Filters";

function Main(): React.ReactElement {
  return (
    <div className="relative flex flex-col h-full">
      <Filters />
      {/* // TODO: The icon will not work well on linux or window */}
      <React.Suspense fallback={<div>🍳 Cooking your data...</div>}>
        <DataTable />
      </React.Suspense>
    </div>
  );
}

export default Main;
