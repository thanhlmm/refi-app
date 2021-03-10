import { docAtom, pathExpanderAtom } from "@/atoms/firestore";
import { navigatorPathAtom } from "@/atoms/navigator";
import { buildTableSubRows, getListCollections } from "@/utils/common";
import {
  Anchor,
  Button,
  ButtonGroup,
  IconButton,
} from "@zendeskgarden/react-buttons";
import { Input } from "@zendeskgarden/react-forms";
import React, { useCallback, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import classNames from "classnames";
import { useTable, useExpanded } from "react-table";
import EditableCell, {
  EditablePropertyField,
  EditablePropertyValue,
} from "../EditableCell";
import { type } from "os";
import { simplify } from "@/utils/simplifr";
import MonacoProperty from "./MonacoProperty";

const PropertyTable = ({ data, doc }) => {
  const PropertyColumns = useMemo(
    () => [
      {
        Header: "Field",
        id: "field",
        accessor: "field",
        Cell: ({ row, value }: { row: any; value: any }) => (
          <EditablePropertyField
            row={doc}
            canExpand={row.canExpand}
            isExpanded={row.isExpanded}
            toggleExpand={row.getToggleRowExpandedProps().onClick.bind(row)}
            column={{ id: row.original.field }}
            tabIndex={row.index * row.cells.length}
          />
        ),
      },
      {
        Header: "Value",
        id: "value",
        accessor: "value",
        Cell: ({ row, value }: { row: any; value: any }) => {
          return (
            <EditablePropertyValue
              row={doc}
              column={{ id: row.original.field }}
              tabIndex={row.index * row.cells.length}
              value={value}
            />
          );
        },
      },
    ],
    [doc]
  );

  // const getSubRows = useCallback(() => {

  // }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns: PropertyColumns,
      data,
      // getSubRows,
    },
    useExpanded // Use the useExpanded plugin hook
  );

  return (
    <div className="w-full">
      <table {...getTableProps()} className="w-full table-fixed">
        {/* <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead> */}
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            const depth = row.isExpanded ? row.depth + 1 : row.depth;
            // console.log({ depth });
            return (
              <tr
                key={row.original.field}
                className={classNames(
                  {
                    "bg-gray-600 ": depth > 0,
                  },
                  `bg-opacity-${depth * 10}`
                )}
              >
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={classNames(
                        "border border-gray-300 align-top",
                        {
                          ["w-32"]: cell.column.id === "field",
                        }
                      )}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Property = () => {
  const currentPath = useRecoilValue(navigatorPathAtom);
  const pathAvailable = useRecoilValue(pathExpanderAtom);
  const doc = useRecoilValue(docAtom(currentPath));
  const [searchInput, setSearchInput] = useState("");
  const [editorType, setEditorType] = useState<"basic" | "advantage">("basic");

  const listCollections = useMemo(() => {
    return getListCollections(currentPath, pathAvailable);
  }, [currentPath, pathAvailable]);

  const fieldData = useMemo(() => {
    // TODO: Expand all when filter is on
    if (doc) {
      // const flatObject = flatten(doc.data()) as Record<string, any>;
      const flatObject = simplify(doc.data(), ".", null) as Record<string, any>;
      const rows = buildTableSubRows(
        Object.keys(flatObject)
          .map((key) => ({
            field: key.substr("root.".length),
            value: flatObject[key],
          }))
          .sort((a, b) => a.field.localeCompare(b.field))
          .filter((row) => {
            if (searchInput) {
              return (
                row.field.toLowerCase().includes(searchInput.toLowerCase()) ||
                String(row.value)
                  .toLowerCase()
                  ?.includes(searchInput.toLowerCase())
              );
            }

            return true;
          })
      );

      return [
        {
          field: "",
          value: { type: "Map" },
        },
        ...rows,
      ];
    }

    return [];
  }, [doc, searchInput]);

  if (!doc) {
    // TODO: Render last doc or select doc in collection
    return null;
  }

  return (
    <div className="h-full">
      <Input
        placeholder="Search for property or value..."
        isCompact
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div className="h-full max-h-full overflow-auto">
        <h3>Collections</h3>
        {listCollections.map((collection) => (
          <div className="block" key={collection}>
            <Anchor href={collection}>{collection}</Anchor>
          </div>
        ))}
        <h3>Fields</h3>
        <ButtonGroup selectedItem={editorType} onSelect={setEditorType}>
          <Button size="small" value="basic">
            <svg
              className="w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </Button>
          <Button size="small" value="advantage">
            <svg
              className="w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </Button>
        </ButtonGroup>
        {editorType === "basic" && <PropertyTable data={fieldData} doc={doc} />}
        {editorType === "advantage" && <MonacoProperty doc={doc} />}
      </div>
    </div>
  );
};

export default Property;
