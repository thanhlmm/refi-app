import React, { useEffect, useRef, useState } from "react";
import { Button } from "@zendeskgarden/react-buttons";
import { debounce, uniqueId } from "lodash";
import { Input } from "@zendeskgarden/react-forms";
import { allColumns, querierAtom } from "@/atoms/navigator";
import { useRecoilState, useRecoilValue } from "recoil";
import FilterItem from "./item";

const Filters = () => {
  const [queryOptions, setQueryOptions] = useRecoilState(querierAtom);
  const allColumnsInView = useRecoilValue(allColumns);

  const handleAddFilter = () => {
    setQueryOptions((filters) => [
      ...filters,
      {
        id: uniqueId("fs.querier"),
        field: "",
        operator: {
          type: "eq",
          values: "",
        },
      },
    ]);
  };

  return (
    <div className="space-y-2">
      {queryOptions.map((filter) => (
        <FilterItem key={filter.id} id={filter.id}></FilterItem>
      ))}
      <div className="flex justify-between">
        <Button size="small" isBasic onClick={handleAddFilter}>
          Add Filters
        </Button>
        <Button size="small" isPrimary>
          Query
        </Button>
      </div>
    </div>
  );
};

export default Filters;
