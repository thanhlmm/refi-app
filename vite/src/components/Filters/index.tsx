import { navigatorCollectionPathAtom, querierAtom } from "@/atoms/navigator";
import { actionSubmitQuery } from "@/atoms/navigator.action";
import { isModalPickProperty, isModalSorter } from "@/atoms/ui";
import PropertyList from "@/components/PropertyList";
import { Button } from "@zendeskgarden/react-buttons";
import { TooltipModal } from "@zendeskgarden/react-modals";
import { uniqueId } from "lodash";
import React, { useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import SorterList from "../SorterList";
import FilterItem from "./item";

const Filters = () => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const [queryOptions, setQueryOptions] = useRecoilState(
    querierAtom(collectionPath)
  );
  const [isShowPropertyList, setShowPropertyList] = useRecoilState(
    isModalPickProperty
  );

  const [isShowSorterList, setShowSorterList] = useRecoilState(isModalSorter);
  const propertyBtnRef = useRef<HTMLButtonElement>(null);
  const sorterBtnRef = useRef<HTMLButtonElement>(null);

  const handleAddFilter = () => {
    setQueryOptions((filters) => [
      ...filters,
      {
        id: uniqueId("fs.querier"),
        field: "",
        operator: {
          type: "==",
          values: "",
        },
        isActive: true,
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

          {/* <Button
            size="small"
            isBasic
            ref={sorterBtnRef}
            onClick={() => {
              setShowSorterList(true);
            }}
          >
            Sort
          </Button> */}

          <TooltipModal
            referenceElement={isShowSorterList ? sorterBtnRef.current : null}
            onClose={() => setShowSorterList(false)}
            placement={"bottom-start"}
            className="p-3 leading-normal"
          >
            <SorterList />
          </TooltipModal>
        </div>
        <Button size="small" isPrimary onClick={() => actionSubmitQuery(true)}>
          Query
        </Button>
      </div>
    </div>
  );
};

export default Filters;
