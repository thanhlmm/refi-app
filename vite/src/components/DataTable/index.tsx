import { collectionWithQueryAtom } from "@/atoms/firestore";
import {
  navigatorCollectionPathAtom,
  navigatorPathAtom,
  propertyListAtom,
} from "@/atoms/navigator";
import { actionRemoveProperty } from "@/atoms/navigator.action";
import { actionToggleModalPickProperty } from "@/atoms/ui.action";
import { useContextMenu } from "@/hooks/contextMenu";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import React, { useCallback, useMemo } from "react";
import { useFlexLayout, useTable, useSortBy } from "react-table";
import { FixedSizeList } from "react-window";
import { useRecoilValue, useSetRecoilState } from "recoil";
import EditableCell, { ReadOnlyField } from "../EditableCell";
import scrollbarWidth from "./scroll-bar-width";

function TableWrapper({
  columns,
  data,
  onRowClick,
}: {
  columns: any[];
  data: ClientDocumentSnapshot[];
  onRowClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    doc: ClientDocumentSnapshot
  ) => void;
}) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 100,
      maxWidth: 200,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      disableMultiSort: false,
    },
    useSortBy,
    useFlexLayout
  );

  const RenderRow = useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className="border-b border-gray-300"
          key={row.original.id}
          cm-template="rowContext"
          cm-id={row.original.id}
          onClick={(e) => onRowClick(e, row.original)}
        >
          {row.cells.map((cell) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <div
                {...cell.getCellProps()}
                className="border-r border-gray-200 last:border-r-0"
              >
                {cell.render("Cell")}
              </div>
            );
          })}
        </div>
      );
    },
    [prepareRow, rows]
  );

  const scrollBarSize = useMemo(() => scrollbarWidth(), []);

  // TODO: Integrate column resize
  return (
    <table
      {...getTableProps()}
      className="w-full max-w-full overflow-auto border-l border-r border-gray-300"
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <div
            {...headerGroup.getHeaderGroupProps()}
            className="border-t border-b border-gray-300"
          >
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <th
                {...column.getHeaderProps(column.getSortByToggleProps())}
                className="text-left text-gray-500 border-r border-gray-200 px-1.5 py-1"
              >
                {column.render("Header")}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                </span>
              </th>
            ))}
          </div>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        <FixedSizeList
          height={400}
          itemCount={rows.length}
          itemSize={35}
          width="100%"
        >
          {RenderRow}
        </FixedSizeList>
      </tbody>
    </table>
  );
}

function ColumnHeader({
  fieldPath,
  collectionPath,
}: {
  fieldPath: string;
  collectionPath: string;
}) {
  useContextMenu("ADD", () => {
    actionToggleModalPickProperty(true);
  });

  useContextMenu("HIDE", ({ column }) => {
    actionRemoveProperty(collectionPath, column);
  });

  return (
    <div cm-template="columnHeaderContext" cm-payload-column={fieldPath}>
      {fieldPath}
    </div>
  );
}

function DataTable() {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const setPath = useSetRecoilState(navigatorPathAtom);
  const data = useRecoilValue(collectionWithQueryAtom(collectionPath));
  const properties = useRecoilValue(propertyListAtom(collectionPath));

  const columnViewer = useMemo(() => {
    const docColumns = properties.map((key, index) => ({
      Header: () => (
        <ColumnHeader fieldPath={key} collectionPath={collectionPath} />
      ),
      accessor: key,
      Cell: ({ row, column, value }: { row: any; column: any; value: any }) => {
        return (
          <EditableCell
            value={value}
            // key={column.id}
            row={row.original}
            column={column}
            tabIndex={row.index * row.cells.length + index}
          />
        );
      },
    }));

    return [
      {
        Header: "_id",
        id: "__id",
        accessor: "id",
        Cell: ({ value }: { value: any }) => <ReadOnlyField value={value} />,
      },
      ...docColumns,
      {
        Header: () => (
          <div
            className="w-5 text-gray-400 cursor-pointer"
            role="presentation"
            onClick={() => actionToggleModalPickProperty(true)}
          >
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        ),
        width: 50,
        id: "addColumn",
        Cell: () => null,
      },
    ];
  }, [properties, collectionPath]);

  const handleRowClick = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      doc: ClientDocumentSnapshot
    ) => {
      setPath(doc.ref.path);
    },
    []
  );

  return (
    <div className="mt-2 overflow-auto">
      <TableWrapper
        columns={columnViewer}
        data={data}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

export default DataTable;
