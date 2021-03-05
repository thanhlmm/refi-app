import React, { useEffect, useRef, useState } from "react";
import { Button } from "@zendeskgarden/react-buttons";
import { debounce, uniqueId } from "lodash";
import { Input } from "@zendeskgarden/react-forms";
import { allColumnsAtom, querierAtom } from "@/atoms/navigator";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import FilterItem from "./item";
import { isModalPickProperty } from "@/atoms/ui";
import { TooltipModal } from "@zendeskgarden/react-modals";
import PropertyList from "@/components/PropertyList";

const Filters = () => {
  const [queryOptions, setQueryOptions] = useRecoilState(querierAtom);
  const allColumnsInView = useRecoilValue(allColumnsAtom);
  const [isShowPropertyList, setShowPropertyList] = useRecoilState(
    isModalPickProperty
  );
  const propertyBtnRef = useRef<HTMLButtonElement>(null);

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
        <div>
          <Button size="small" isBasic onClick={handleAddFilter}>
            Add Filters
          </Button>
          <Button
            size="small"
            isBasic
            ref={propertyBtnRef}
            onClick={() => {
              setShowPropertyList(true);
            }}
          >
            Properties
          </Button>

          <TooltipModal
            referenceElement={
              isShowPropertyList ? propertyBtnRef.current : null
            }
            onClose={() => setShowPropertyList(false)}
            placement={"bottom-start"}
            className="p-3 leading-normal"
          >
            <PropertyList />
          </TooltipModal>
        </div>
        <Button size="small" isPrimary>
          Query
        </Button>
      </div>
    </div>
  );
};

export default Filters;
