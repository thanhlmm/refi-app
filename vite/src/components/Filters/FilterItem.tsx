import {
  navigatorCollectionPathAtom,
  querierAtom,
  querierOptionAtom,
  IArrayOperator,
} from "@/atoms/navigator";
import FieldFinderInput from "@/components/FieldFinderInput";
import SelectComboBox from "@/components/SelectComboBox";
import { isNumeric, isArrayOp } from "@/utils/common";
import { convertFSValue } from "@/utils/fieldConverter";
import { operatorOptions } from "@/utils/searcher";
import { Button, IconButton } from "@zendeskgarden/react-buttons";
import { Input } from "@zendeskgarden/react-forms";
import immer from "immer";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import DropdownMenu from "../DropdownMenu";
import Test from "../Test";

const arrayInput = ["in", "not-in", "array-contains"];

const FilterItem = ({ id }: { id: string }) => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const setQueryOptions = useSetRecoilState(querierAtom(collectionPath));
  const inputRef = useRef<HTMLInputElement>();
  const [filter, setFilter] = useRecoilState(
    querierOptionAtom({ id, path: collectionPath })
  );

  const handleRemoveFilter = () => {
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
    if (value === filter?.operator.type) {
      return;
    }
    const isArrayInput = arrayInput.includes(value);
    setFilter(
      immer((curFilter) => {
        if (curFilter) {
          curFilter.operator.type = value;
          if (isArrayInput && !Array.isArray(curFilter.operator.values)) {
            curFilter.operator.values = [curFilter.operator.values];
          }

          if (!isArrayInput && Array.isArray(curFilter.operator.values)) {
            curFilter.operator.values = curFilter.operator.values.pop() || "";
          }
        }
      })
    );
  };

  const handleChangeValue = (value) => {
    const newValue =
      (typeof filter?.operator.values === "number" && isNumeric(value)) ||
      value === ""
        ? Number(value)
        : value;
    setFilter(
      immer((curFilter) => {
        if (curFilter) {
          curFilter.operator.values = newValue;
        }
      })
    );
  };

  useLayoutEffect(() => {
    // Auto focus if this filter is new
    if (!filter?.field) {
      inputRef.current?.focus();
    }
  }, []);

  if (!filter) {
    return null;
  }

  const menuOptions = ["string", "number", "true", "false"].map(
    (fieldType) => ({
      title: fieldType,
      hint: fieldType,
      onClick: () => {
        if (fieldType === "true") {
          handleChangeValue(true);
          return;
        }

        if (fieldType === "false") {
          handleChangeValue(false);
          return;
        }

        const newValue = convertFSValue(
          filter.operator.values,
          fieldType as RefiFS.IFieldType
        );
        handleChangeValue(newValue);
      },
    })
  );

  const inputComponent = useMemo(() => {
    if (isArrayOp(filter.operator)) {
      const handleChangeArrayItemValue = (value, index: number) => {
        const newValueArray = [...(filter.operator.values as any[])];
        const newValue =
          (typeof value === "number" && isNumeric(value)) || value === ""
            ? Number(value)
            : value;
        newValueArray[index] = newValue;

        handleChangeValue(newValueArray);
      };

      const menuOptions = (value, index) =>
        ["string", "number", "true", "false"].map((fieldType) => ({
          title: fieldType,
          hint: fieldType,
          onClick: () => {
            if (fieldType === "true") {
              handleChangeArrayItemValue(true, index);
              return;
            }

            if (fieldType === "false") {
              handleChangeArrayItemValue(false, index);
              return;
            }

            const newValue = convertFSValue(
              value,
              fieldType as RefiFS.IFieldType
            );
            handleChangeArrayItemValue(newValue, index);
          },
        }));

      const handleAddItem = () => {
        handleChangeValue([...(filter.operator.values as any[]), ""]);
      };

      const handleRemoveItem = (index) => {
        handleChangeValue(
          (filter.operator.values as any[]).filter((_, i) => i !== index)
        );
      };

      return (
        <div className="grid items-start grid-cols-3 gap-2">
          {filter.operator.values.map((value, index) => (
            <div className="relative group" key={index}>
              <div className="absolute z-20 top-1 left-1">
                <DropdownMenu menu={menuOptions(value, index)} isSmall>
                  <button
                    role="button"
                    className="p-1 font-mono text-xs text-red-700 hover:bg-white hover:border hover:border-gray-300"
                    tabIndex={-1}
                  >
                    {typeof value}
                  </button>
                </DropdownMenu>
              </div>
              <Input
                isCompact
                className="pl-16"
                value={String(value)}
                tabIndex={index * 10 + 1}
                onChange={(e) =>
                  handleChangeArrayItemValue(e.target.value, index)
                }
                readOnly={typeof value === "boolean"}
              />
              <button
                className="absolute top-0 right-0 z-20 px-1 py-2 text-gray-500 opacity-0 group-hover:opacity-100"
                onClick={() => handleRemoveItem(index)}
              >
                <div className="w-5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
                    />
                  </svg>
                </div>
              </button>
            </div>
          ))}
          <Button
            size="small"
            className="w-24"
            title="Add item"
            onClick={handleAddItem}
          >
            <div className="w-5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.5 1h12l.5.5v12l-.5.5h-12l-.5-.5v-12l.5-.5zM2 13h11V2H2v11z"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 4H7v3H4v1h3v3h1V8h3V7H8V4z"
                />
              </svg>
            </div>
            Add item
          </Button>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="absolute z-20 top-1 left-1">
          <DropdownMenu menu={menuOptions} isSmall>
            <button
              role="button"
              className="p-1 font-mono text-xs text-red-700 hover:bg-white hover:border hover:border-gray-300"
            >
              {typeof filter.operator.values}
            </button>
          </DropdownMenu>
        </div>
        <Input
          isCompact
          className="pl-16"
          value={String(filter?.operator.values)}
          onChange={(e) => handleChangeValue(e.target.value)}
          readOnly={typeof filter.operator.values === "boolean"}
        />
      </div>
    );
  }, [filter.operator.type, filter.operator.values]);

  return (
    <div
      key={filter.id}
      className={`flex flex-row space-x-2 ${!filter.isActive && "opacity-60"}`}
    >
      <div className="max-w-xs w-60">
        <FieldFinderInput
          value={filter.field}
          onChange={handleSetField}
          inputRef={inputRef as any}
        />
      </div>
      <div className="max-w-xs w-30">
        <SelectComboBox
          items={operatorOptions.map((option) => option.value)}
          selectedItem={filter.operator.type}
          handleSelectedItemChange={handleSetOperatorType}
        />
      </div>
      <div className="w-full">{inputComponent}</div>
      <IconButton size="small" isPill onClick={handleToggleActiveFilter}>
        <div className="w-5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15 2v1.67l-5 4.759V14H6V8.429l-5-4.76V2h14zM7 8v5h2V8l5-4.76V3H2v.24L7 8z"
            />
          </svg>
        </div>
      </IconButton>
      <IconButton size="small" isPill onClick={handleRemoveFilter}>
        <div className="w-5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
            />
          </svg>
        </div>
      </IconButton>
    </div>
  );
};

export default FilterItem;
