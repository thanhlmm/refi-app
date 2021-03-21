import { collectionWithQueryAtom } from "@/atoms/firestore";
import { actionDeleteDoc, actionDuplicateDoc } from "@/atoms/firestore.action";
import {
  navigatorCollectionPathAtom,
  navigatorPathAtom,
  propertyListAtom,
} from "@/atoms/navigator";
import {
  actionAddFilter,
  actionExportDocCSV,
  actionExportDocJSON,
  actionExportViewCSV,
  actionExportViewJSON,
  actionRemoveProperty,
} from "@/atoms/navigator.action";
import { largeDataAtom } from "@/atoms/ui";
import { actionToggleModalPickProperty } from "@/atoms/ui.action";
import { useContextMenu } from "@/hooks/contextMenu";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { useFlexLayout, useSortBy, useTable } from "react-table";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { useRecoilValue, useSetRecoilState } from "recoil";
import EditableCell, { IDReadOnlyField } from "../EditableCell";

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
    totalColumnsWidth,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      disableMultiSort: false,
    } as any,
    useSortBy,
    // useResizeColumns,
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
      const rowOrigin = row.original as ClientDocumentSnapshot;
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className="border-b border-gray-300 hover:bg-gray-200 group"
          key={rowOrigin.id}
          cm-template="rowContext"
          cm-id="rowContext"
          cm-payload-id={rowOrigin.id}
          cm-payload-path={rowOrigin.ref.path}
          onClick={(e) => onRowClick(e, rowOrigin)}
        >
          {row.cells.map((cell) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <div
                {...cell.getCellProps()}
                className="border-r border-gray-200 last:border-r-0 group-hover:border-gray-300"
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

  const handleScroll = useCallback(({ target }) => {
    const { scrollTop } = target;

    (listRef.current as any)?.scrollTo(scrollTop);
  }, []);

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
                className="text-left text-gray-500 border-r border-gray-200"
              >
                {column.render("Header", {
                  isSorted: (column as any)?.isSorted,
                  isSortedDesc: (column as any).isSortedDesc,
                  toggleSortBy: (column as any).toggleSortBy,
                })}
                {/* <div
                  {...column.getResizerProps()}
                  className={classNames(
                    "bg-blue-700 w-px h-full inline-block transform -translate-x-1 hover:w-1 hover:scale-x-150 pl-1"
                  )}
                /> */}
              </th>
            ))}
          </div>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} className="block h-full">
        <Scrollbars
          style={{ height: "100%", width: "100%" }}
          // autoHide
          // autoHeight
          // autoHeightMin={600}
          // autoHeightMax={700}
          onScroll={handleScroll}
          hideTracksWhenNotNeeded
        >
          <AutoSizer disableWidth>
            {({ height }) => (
              <FixedSizeList
                height={height}
                itemCount={rows.length}
                itemSize={35}
                width="100%"
                ref={listRef}
                style={{ overflow: false }}
              >
                {RenderRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        </Scrollbars>
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
  // TODO: Move listener to outside component
  useContextMenu(
    "ADD",
    () => {
      actionToggleModalPickProperty(true);
    },
    fieldPath
  );

  useContextMenu(
    "HIDE",
    ({ column }: { column: string }) => {
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
    ({ column }: { column: string }) => {
      actionAddFilter(column, "==", collectionPath);
    },
    fieldPath
  );

  return (
    <div
      className="flex flex-row items-center justify-between p-1.5"
      cm-template="columnHeaderContext"
      cm-payload-column={fieldPath}
      cm-id={fieldPath}
    >
      <div className="font-semibold text-gray-800 truncate">{fieldPath}</div>
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

interface IRowContextPayload {
  id: string;
  path: string;
}

function DataTable() {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const setPath = useSetRecoilState(navigatorPathAtom);
  const data = useRecoilValue(collectionWithQueryAtom(collectionPath));
  const properties = useRecoilValue(propertyListAtom(collectionPath));

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
        Cell: ({
          value,
          row,
        }: {
          value: any;
          row: { original: ClientDocumentSnapshot };
        }) => <IDReadOnlyField value={value} isNew={row.original.isNew} />,
      },
      ...docColumns,
      {
        Header: () => (
          <div
            className="flex justify-center w-5 h-full text-gray-400 cursor-pointer"
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

  useContextMenu<IRowContextPayload>(
    "DUPLICATE",
    ({ path }) => {
      actionDuplicateDoc(path);
    },
    "rowContext"
  );

  useContextMenu<IRowContextPayload>(
    "EXPORT_CSV",
    ({ path }) => {
      actionExportDocCSV(path);
    },
    "rowContext"
  );

  useContextMenu<IRowContextPayload>(
    "EXPORT_JSON",
    ({ path }) => {
      actionExportDocJSON(path);
    },
    "rowContext"
  );

  useContextMenu<IRowContextPayload>(
    "EXPORT_VIEW_CSV",
    () => {
      actionExportViewCSV();
    },
    "rowContext"
  );

  useContextMenu<IRowContextPayload>(
    "EXPORT_VIEW_JSON",
    () => {
      actionExportViewJSON();
    },
    "rowContext"
  );

  useContextMenu<IRowContextPayload>(
    "DELETE",
    ({ path }) => {
      actionDeleteDoc(path);
    },
    "rowContext"
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

const DataTableLoader = () => {
  const isLoaded = useRecoilValue(largeDataAtom); // Make parent suspense

  if (isLoaded) {
    return <DataTable />;
  }

  return null;
};

export default DataTableLoader;