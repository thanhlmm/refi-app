import { collectionWithQueryAtom } from "@/atoms/firestore";
import {
  navigatorCollectionPathAtom,
  navigatorPathAtom,
  propertyListAtom,
} from "@/atoms/navigator";
import {
  actionAddFilter,
  actionRemoveProperty,
} from "@/atoms/navigator.action";
import { largeDataAtom } from "@/atoms/ui";
import { actionToggleModalPickProperty } from "@/atoms/ui.action";
import { useContextMenu } from "@/hooks/contextMenu";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useFlexLayout, useSortBy, useTable } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
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
    } as any,
    useSortBy,
    useFlexLayout
  );

  const listRef = useRef();

  useEffect(() => {
    // Scroll to bottom when new doc is added
    const lastIndex = data.length - 1;
    const lastRow = data[lastIndex];

    if (lastRow && lastRow.isNew) {
      (listRef.current as any)?.scrollToItem(lastIndex);
    }
  }, [data]);

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
          key={(row.original as any)?.id}
          cm-template="rowContext"
          cm-id={(row.original as any)?.id}
          onClick={(e) => onRowClick(e, row.original as ClientDocumentSnapshot)}
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
      className="w-full h-full border-b border-gray-300"
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
                {...column.getHeaderProps(
                  (column as any).getSortByToggleProps()
                )}
                className="text-left text-gray-500 border-r border-gray-200 px-1.5 py-1"
              >
                {column.render("Header", {
                  isSorted: (column as any)?.isSorted,
                  isSortedDesc: (column as any).isSortedDesc,
                  toggleSortBy: (column as any).toggleSortBy,
                })}
              </th>
            ))}
          </div>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} className="block h-full">
        <AutoSizer disableWidth>
          {({ height }) => (
            <FixedSizeList
              height={height}
              itemCount={rows.length}
              itemSize={35}
              width="100%"
              ref={listRef}
            >
              {RenderRow}
            </FixedSizeList>
          )}
        </AutoSizer>
      </tbody>
    </table>
  );
}

interface IColumnHeaderProps {
  fieldPath: string;
  collectionPath: string;
  isSorted: boolean;
  isSortedDesc: boolean;
  hidable: boolean;
  toggleSortBy: (descending: boolean, isMulti: boolean) => void;
}

function ColumnHeader({
  fieldPath,
  collectionPath,
  isSorted,
  isSortedDesc,
  toggleSortBy,
  hidable = true,
}: IColumnHeaderProps) {
  useContextMenu(
    "ADD",
    () => {
      actionToggleModalPickProperty(true);
    },
    fieldPath
  );

  useContextMenu(
    "HIDE",
    ({ column }) => {
      if (hidable) {
        actionRemoveProperty(collectionPath, column);
      }
    },
    fieldPath
  );

  useContextMenu(
    "ASC",
    () => {
      toggleSortBy(false, false);
    },
    fieldPath
  );

  useContextMenu(
    "DESC",
    () => {
      toggleSortBy(true, false);
    },
    fieldPath
  );

  useContextMenu(
    "FILTER",
    ({ column }) => {
      actionAddFilter(column, "==", collectionPath);
    },
    fieldPath
  );

  return (
    <div
      className="flex flex-row items-center justify-between"
      cm-template="columnHeaderContext"
      cm-payload-column={fieldPath}
      cm-id={fieldPath}
    >
      <span>{fieldPath}</span>
      {isSorted && (
        <span>
          {isSortedDesc ? (
            <svg
              className="w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
          ) : (
            <svg
              className="w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
              />
            </svg>
          )}
        </span>
      )}
    </div>
  );
}

function DataTable() {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const setPath = useSetRecoilState(navigatorPathAtom);
  const data = useRecoilValue(collectionWithQueryAtom(collectionPath));
  const properties = useRecoilValue(propertyListAtom(collectionPath));
  const isLargeData = useRecoilValue(largeDataAtom); // Make parent suspense

  const columnViewer = useMemo(() => {
    const docColumns = properties.map((key, index) => ({
      Header: (props) => (
        <ColumnHeader
          {...props}
          fieldPath={key}
          collectionPath={collectionPath}
        />
      ),
      accessor: key,
      Cell: ({ row, column, value }: { row: any; column: any; value: any }) => {
        return (
          <EditableCell
            value={value}
            key={column.id}
            row={row.original}
            column={column}
            tabIndex={row.index * row.cells.length + index}
          />
        );
      },
    }));

    return [
      {
        Header: (props) => (
          <ColumnHeader
            {...props}
            fieldPath="_id"
            hidable={false}
            collectionPath={collectionPath}
          />
        ),
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
    <div className="h-full mt-2 overflow-x-auto border-l border-r border-gray-300">
      <TableWrapper
        columns={columnViewer}
        data={data}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

export default DataTable;
