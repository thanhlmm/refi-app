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
import immer from "immer";
import React from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const FilterItem = ({ id }: { id: string }) => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const [filter, setFilter] = useRecoilState(
    querierOptionAtom({ id, path: collectionPath })
  );
  const setQueryOptions = useSetRecoilState(querierAtom(collectionPath));

  const handleRemoveFilter = (id: string) => {
    setQueryOptions((filters) => filters.filter((filter) => filter.id !== id));
  };

  const handleToggleActiveFilter = () => {
    setFilter(
      immer((curFilter) => {
        if (curFilter) {
          curFilter.isActive = !curFilter.isActive;
        }
      })
    );
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
    <div
      key={filter.id}
      className={`flex flex-row space-x-2 ${!filter.isActive && "opacity-40"}`}
    >
      <div className="max-w-xs w-60">
        <FieldFinderInput
          value={filter.field}
          onChange={handleSetField}
          collectionPath={collectionPath}
        />
      </div>
      <div className="max-w-xs w-30">
        <InputComboBox
          items={operatorOptions.map((option) => option.value)}
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
        onClick={() => handleToggleActiveFilter()}
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </div>
      </IconButton>
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
