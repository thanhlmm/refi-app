import {
  navigatorCollectionPathAtom,
  querierAtom,
  querierOptionAtom,
} from "@/atoms/navigator";
import InputComboBox from "@/components/InputComboBox";
import FieldFinderInput from "@/components/FieldFinderInput";
import { operatorOptions } from "@/utils/searcher";
import { IconButton } from "@zendeskgarden/react-buttons";
import { Input } from "@zendeskgarden/react-forms";
import { useDebounceEffect } from "ahooks";
import immer from "immer";
import React, { useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const FilterItem = ({ id }: { id: string }) => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const [filter, setFilter] = useRecoilState(querierOptionAtom(id));
  const setQueryOptions = useSetRecoilState(querierAtom);

  const handleRemoveFilter = (id) => {
    setQueryOptions((filters) => filters.filter((filter) => filter.id !== id));
  };

  const handleSetField = (value) => {
    setFilter(
      immer((curFilter) => {
        if (curFilter) {
          curFilter.field = value;
        }
      })
    );
  };

  const handleSetOperatorType = (value) => {
    console.log({ value });
    setFilter(
      immer((curFilter) => {
        curFilter.operator.type = value;
      })
    );
  };

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(
      immer((curFilter) => {
        curFilter.operator.values = e.target.value;
      })
    );
  };

  if (!filter) {
    return null;
  }

  return (
    <div key={filter.id} className="flex flex-row space-x-2">
      <div className="max-w-xs w-60">
        <FieldFinderInput
          value={filter.field}
          onChange={handleSetField}
          collectionPath={collectionPath}
        />
      </div>
      <div className="max-w-xs w-30">
        <InputComboBox
          items={operatorOptions.map((option) => option.label)}
          selectedItem={filter.operator.type}
          handleSelectedItemChange={handleSetOperatorType}
        />
      </div>
      <div className="w-full">
        <Input
          isCompact
          value={filter.operator.values}
          onChange={handleChangeValue}
        />
      </div>
      <IconButton
        size="small"
        isPill
        onClick={() => handleRemoveFilter(filter.id)}
      >
        <div className="w-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
      </IconButton>
    </div>
  );
};

export default FilterItem;
