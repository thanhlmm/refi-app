import React, { useCallback, useEffect, useMemo } from "react";
import { useTable, useExpanded } from "react-table";
import classNames from "classnames";
import EditablePropertyField from "@/components/EditableCell/EditablePropertyField";
import EditablePropertyValue from "../EditableCell/EditablePropertyValue";
import { simplify } from "@/utils/simplifr";
import { buildTableSubRows } from "@/utils/common";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { setRecoilExternalState } from "@/atoms/RecoilExternalStatePortal";
import { buildFSUrl, fieldAtom } from "@/atoms/firestore";
import { uniqueId } from "lodash";
import { FIELD_KEY_PREFIX } from "@/utils/contant";
import { newFieldAtom } from "@/atoms/ui";

interface IPropertyTableProps {
  doc: ClientDocumentSnapshot;
  searchInput: string;
}
const PropertyTable = ({ searchInput, doc }: IPropertyTableProps) => {
  const propertyColumns = useMemo(
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
            docPath={doc.ref.path}
            canExpand={row.canExpand}
            isExpanded={row.isExpanded}
            depth={depth}
            toggleExpand={row.toggleRowExpanded}
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
              row={row.original}
              column={{ id: row.original.field }}
              tabIndex={row.index * row.cells.length}
              toggleExpand={row.toggleRowExpanded}
              docPath={doc.ref.path}
            />
          );
        },
      },
    ],
    [doc.ref.path]
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
      columns: propertyColumns,
      data: fieldData,
      autoResetExpanded: false,
      // getSubRows,
    } as any,
    useExpanded // Use the useExpanded plugin hook
  );

  const handleAddProperty = useCallback(() => {
    const fieldAtomInstance = fieldAtom(
      buildFSUrl({ path: doc.ref.path, field: "" })
    );
    const newFieldName = uniqueId(FIELD_KEY_PREFIX);
    setRecoilExternalState(fieldAtomInstance, (value: any) => ({
      ...value,
      [newFieldName]: "",
    }));
    setRecoilExternalState(newFieldAtom(doc.ref.path), newFieldName);
  }, [doc]);

  return (
    <div className="w-full">
      <table {...getTableProps()} className="w-full table-fixed">
        <tbody {...getTableBodyProps()}>
          {rows.map((row: any, i) => {
            prepareRow(row);
            const depth = row.isExpanded
              ? row.depth + 1
              : (row.depth as number);
            return (
              <tr key={row.original.field}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      key={row.original.field + "." + cell.column.id}
                      role="cell"
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
      <button
        role="button"
        className="flex flex-row items-center justify-center p-1 mt-1 text-xs bg-white border border-gray-300"
        onClick={handleAddProperty}
      >
        <div className="inline-block w-4 mr-1 text-green-500">
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
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        Add property
      </button>
    </div>
  );
};

PropertyTable.whyDidYouRender = true;

export default PropertyTable;
