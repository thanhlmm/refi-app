import React, { useState } from "react";
import { IconButton } from "@zendeskgarden/react-buttons";
import {
  Item,
  Menu,
  Field,
  Dropdown,
  Autocomplete,
} from "@zendeskgarden/react-dropdowns";
import { Input } from "@zendeskgarden/react-forms";
import {
  allColumnsAtom,
  querierAtom,
  querierOptionAtom,
} from "@/atoms/navigator";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { operatorOptions } from "@/utils/searcher";
import { useDebounceEffect } from "ahooks";
import immer from "immer";
import { values } from "lodash";

const FilterItem = ({ id }: { id: string }) => {
  const [filter, setFilter] = useRecoilState(querierOptionAtom(id));
  const [inputFieldValue, setFieldInputValue] = useState("");
  const setQueryOptions = useSetRecoilState(querierAtom);
  const allColumnsInView = useRecoilValue(allColumnsAtom);
  const [matchingFields, setMatchingFields] = useState(allColumnsInView);
  const [matchingOperators, setMatchingOperators] = useState(operatorOptions);
  const [inputOperatorValue, setOperatorInputValue] = useState("");

  const handleRemoveFilter = (id) => {
    setQueryOptions((filters) => filters.filter((filter) => filter.id !== id));
  };

  useDebounceEffect(
    () => {
      const matchedOptions = allColumnsInView.filter(
        (option) =>
          option
            .trim()
            .toLowerCase()
            .indexOf(inputFieldValue.trim().toLowerCase()) !== -1
      );

      setMatchingFields(matchedOptions);
    },
    [inputFieldValue],
    { wait: 300 }
  );

  const handleSetField = (value) => {
    setFilter(
      immer((curFilter) => {
        if (curFilter) {
          curFilter.field = value;
        }
      })
    );
  };

  useDebounceEffect(
    () => {
      const result = operatorOptions.filter(
        (option) =>
          option.keyword
            .trim()
            .toLowerCase()
            .indexOf(inputFieldValue.trim().toLowerCase()) !== -1
      );
      console.log({ result });
      setMatchingOperators(result.map((result) => result));
    },
    [inputOperatorValue],
    { wait: 300 }
  );

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
    <div key={filter.id} className="flex flex-row space-x-2">
      {/* // TODO: Expand when click */}
      <div className="max-w-xs w-60">
        <Dropdown
          inputValue={inputFieldValue}
          selectedItem={filter.field}
          onSelect={(item) => handleSetField(item)}
          onInputValueChange={setFieldInputValue}
          downshiftProps={{ defaultHighlightedIndex: 0 }}
        >
          <Field>
            <Autocomplete isCompact>{filter.field}</Autocomplete>
          </Field>
          <Menu isCompact isAnimated={false}>
            {matchingFields.length ? (
              matchingFields.map((option) => (
                <Item key={option} value={option}>
                  <span>{option}</span>
                </Item>
              ))
            ) : (
              <Item disabled>No matches found</Item>
            )}
          </Menu>
        </Dropdown>
      </div>
      <div className="max-w-xs w-30">
        <Dropdown
          inputValue={inputOperatorValue}
          selectedItem={filter.operator.type}
          onSelect={(item) => handleSetOperatorType(item)}
          onInputValueChange={setOperatorInputValue}
          downshiftProps={{ defaultHighlightedIndex: 0 }}
        >
          <Field>
            <Autocomplete isCompact>{filter.operator.type}</Autocomplete>
          </Field>
          <Menu isCompact isAnimated={false}>
            {matchingOperators.map((option) => (
              <Item key={option.value} value={option.value}>
                <span>{option.label}</span>
              </Item>
            ))}
          </Menu>
        </Dropdown>
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
              strokeWidth={1}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
      </IconButton>
    </div>
  );
};

export default FilterItem;
