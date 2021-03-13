import React, { useMemo } from "react";
import { useTable, useExpanded } from "react-table";
import classNames from "classnames";
import EditablePropertyField from "@/components/EditableCell/EditablePropertyField";
import EditablePropertyValue from "../EditableCell/EditablePropertyValue";
import { simplify } from "@/utils/simplifr";
import { buildTableSubRows } from "@/utils/common";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";

interface IPropertyTableProps {
  doc: ClientDocumentSnapshot;
  searchInput: string;
}
const PropertyTable = ({ searchInput, doc }: IPropertyTableProps) => {
  const PropertyColumns = useMemo(
    () => [
      {
        Header: "Field",
        id: "field",
        accessor: "field",
        Cell: ({
          row,
          value,
          depth,
        }: {
          row: any;
          value: any;
          depth: number;
        }) => (
          <EditablePropertyField
            row={doc}
            canExpand={row.canExpand}
            isExpanded={row.isExpanded}
            depth={depth}
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

  const fieldData = useMemo(() => {
    // TODO: Expand all when filter is on
    if (doc) {
      // const flatObject = flatten(doc.data()) as Record<string, any>;
      const flatObject = simplify(doc.data(), ".");
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

      return rows;
    }

    return [];
  }, [doc, searchInput]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns: PropertyColumns,
      data: fieldData,
      // autoResetExpanded: false,
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
            const depth = row.isExpanded
              ? row.depth + 1
              : (row.depth as number);
            // console.log({ depth });
            return (
              <tr key={row.original.field}>
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
                      {cell.render("Cell", { depth })}
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

export default PropertyTable;
