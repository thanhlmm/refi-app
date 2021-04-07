import { collectionWithQueryAtom } from "@/atoms/firestore";
import {
  actionDeleteDoc,
  actionDuplicateDoc,
  actionSetFieldValue,
} from "@/atoms/firestore.action";
import {
  navigatorCollectionPathAtom,
  navigatorPathAtom,
  propertyListAtom,
  propertyListCoreAtom,
  sorterAtom,
} from "@/atoms/navigator";
import {
  actionAddFilter,
  actionExportDocCSV,
  actionExportDocJSON,
  actionExportViewCSV,
  actionExportViewJSON,
  actionRemoveProperty,
  actionSetProperty,
  actionSubmitQuery,
} from "@/atoms/navigator.action";
import {
  atomObservable,
  getRecoilExternalLoadable,
  setRecoilExternalState,
} from "@/atoms/RecoilExternalStatePortal";
import { largeDataAtom } from "@/atoms/ui";
import { actionToggleModalPickProperty } from "@/atoms/ui.action";
import { useContextMenu } from "@/hooks/contextMenu";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import {
  getIdFromPath,
  getSampleColumn,
  ignoreBackdropEvent,
} from "@/utils/common";
import { Cell } from "@zendeskgarden/react-tables";
import classNames from "classnames";
import { get, throttle, uniqueId } from "lodash";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import {
  useFlexLayout,
  useResizeColumns,
  useSortBy,
  useTable,
} from "react-table";
import { useAsync, useCustomCompareEffect } from "react-use";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { useRecoilValue, useSetRecoilState } from "recoil";
import EditableCell, { IDReadOnlyField } from "../EditableCell";

const EASY_SCROLL_COLUMN_COUNT = 5;

function TableWrapper({
  columns,
  data,
  onRowClick,
  onSortColumn,
}: {
  columns: any[];
  data: ClientDocumentSnapshot[];
  onRowClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    doc: ClientDocumentSnapshot
  ) => void;
  onSortColumn: (
    sorter: {
      id: string;
      desc: boolean;
    }[]
  ) => void;
}) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 50,
      width: 100,
      maxWidth: 600,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      disableMultiSort: false,
      manualSortBy: true,
    } as any,
    useSortBy,
    useResizeColumns,
    useFlexLayout
    // useBlockLayout
  );

  const tableState = state as any;

  const listRef = useRef();
  const headerRef = useRef<HTMLDivElement>(null);
  const newestDocRef = useRef<undefined | ClientDocumentSnapshot>(undefined);
  const scrollerRef = useRef(null);

  useEffect(() => {
    onSortColumn(tableState.sortBy);
  }, [tableState.sortBy]);

  useEffect(() => {
    const pathObserver = atomObservable(navigatorPathAtom).subscribe({
      next: (path) => {
        const docId = getIdFromPath(path);
        if (docId) {
          scrollToDocId(docId);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });

    return () => {
      return pathObserver.unsubscribe();
    };
  }, [data]);

  // Hook to auto scroll to newest doc
  useCustomCompareEffect(
    () => {
      const newestDoc = data
        .filter((doc) => doc.isNew)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .pop();

      if (newestDoc && newestDoc.id !== newestDocRef.current?.id) {
        newestDocRef.current = newestDoc;
        scrollToDocId(newestDoc.id);
      }
    },
    [data.length],
    ([prevLength], [nextLength]) => {
      return prevLength <= nextLength;
    }
  );

  const scrollToDocId = useCallback(
    (id: string) => {
      const docElement = document.querySelector(`[data-id='${id}']`);
      if (docElement) {
        const observer = new IntersectionObserver(
          function (entries, observer) {
            if (!entries[0].isIntersecting) {
              docElement.scrollIntoView({ block: "center" });
            }
            // Ignore scroll if element is in view
            observer.disconnect();
          },
          { threshold: [1] }
        );
        observer.observe(docElement);
        return;
      }
      const dataIndex = data.findIndex((doc) => doc.id === id);
      const position = (listRef.current as any)?._getItemStyle(dataIndex);
      if (position && position.top >= 0) {
        (scrollerRef.current as any)?.scrollTop(position.top);
      }
    },
    [data]
  );

  const RenderRow = useCallback(
    ({ data, index, style }) => {
      const row = data[index];
      prepareRow(row);
      const rowOrigin = row.original as ClientDocumentSnapshot;
      return (
        <div
          {...row.getRowProps({
            style: {
              ...style,
              minWidth: "100%",
              width: "auto",
            },
            key: rowOrigin.id,
          })}
          className="border-b border-gray-300 hover:bg-gray-200 group"
          data-id={rowOrigin.id}
          onClick={(e) => onRowClick(e, rowOrigin)}
        >
          {row.cells.map((cell) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <div
                {...cell.getCellProps()}
                className="border-r border-gray-200 last:border-r-0 group-hover:border-gray-300"
                cm-template="rowContext"
                cm-id="rowContext"
                cm-payload-id={rowOrigin.id}
                cm-payload-path={rowOrigin.ref.path}
                cm-payload-column={cell.column.id}
              >
                {cell.render("Cell")}
              </div>
            );
          })}
        </div>
      );
    },
    [prepareRow]
  );

  const handleScroll = useCallback(
    ({ target }) => {
      if (columns.length < EASY_SCROLL_COLUMN_COUNT) {
        scrollWindowDebounce(target);
      }
    },
    [columns.length]
  );

  const handleScrollStop = useCallback(() => {
    if (columns.length >= EASY_SCROLL_COLUMN_COUNT) {
      const scrollTop = (scrollerRef.current as any)?.getScrollTop() || 0;
      const scrollLeft = (scrollerRef.current as any)?.getScrollLeft() || 0;
      (listRef.current as any)?.scrollTo(scrollTop);
      headerRef.current?.scrollTo(scrollLeft, 0);
    }
  }, [scrollerRef.current, columns.length]);

  const scrollWindowDebounce = useCallback(
    throttle(({ scrollTop, scrollLeft }) => {
      (listRef.current as any)?.scrollTo(scrollTop);
      headerRef.current?.scrollTo(scrollLeft, 0);
    }, 200),
    []
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <table
          {...getTableProps()}
          className="w-full h-full border-b border-gray-300"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              // eslint-disable-next-line react/jsx-key
              <div
                {...headerGroup.getHeaderGroupProps({
                  style: {
                    width,
                    overflow: "hidden",
                    minWidth: "unset",
                  },

                  className: "border-t border-b border-gray-300",
                })}
                ref={headerRef}
              >
                {headerGroup.headers.map((column) => (
                  // eslint-disable-next-line react/jsx-key
                  <th
                    {...column.getHeaderProps(
                      (column as any).getSortByToggleProps()
                    )}
                    className="text-left text-gray-500 border-r border-gray-200"
                  >
                    <div
                      {...(column as any).getResizerProps({
                        onClick: ignoreBackdropEvent,
                      })}
                      className={classNames(
                        "w-px h-full inline-block transform translate-x-px hover:bg-gray-400 pl-1 absolute top-0 -right-px"
                      )}
                    />
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
            <Scrollbars
              style={{ height: height - 36, width }}
              autoHide
              onScroll={handleScroll}
              onScrollStop={handleScrollStop}
              hideTracksWhenNotNeeded
              ref={scrollerRef}
            >
              <FixedSizeList
                height={height - 34}
                itemCount={rows.length}
                itemSize={36}
                width={width}
                itemData={rows}
                itemKey={(id, data) => data[id].original.id}
                ref={listRef}
                style={{ overflow: false }}
              >
                {RenderRow}
              </FixedSizeList>
            </Scrollbars>
          </tbody>
        </table>
      )}
    </AutoSizer>
  );
}

interface IColumnHeaderProps {
  fieldPath: string;
  collectionPath: string;
  isSorted: boolean;
  isSortedDesc: boolean;
  hidable: boolean;
  toggleSortBy: (descending: boolean, isMulti: boolean) => void;
  isIdColumn?: boolean;
}

function ColumnHeader({
  fieldPath,
  collectionPath,
  isSorted,
  isSortedDesc,
  toggleSortBy,
  hidable = true,
  isIdColumn = false,
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
      cm-template={isIdColumn ? undefined : "columnHeaderContext"}
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

  useAsync(async () => {
    // Auto set property if it haven't set
    const propertiesCore = await getRecoilExternalLoadable(
      propertyListCoreAtom(collectionPath)
    ).toPromise();
    if (!propertiesCore && properties.length === 0 && data.length > 0) {
      actionSetProperty(collectionPath, getSampleColumn(data));
    }
  }, [collectionPath, properties, data]);
  const columnViewer = useMemo(() => {
    const docColumns = properties.map((key, index) => ({
      Header: (props) => (
        <ColumnHeader
          {...props}
          fieldPath={key}
          collectionPath={collectionPath}
        />
      ),
      accessor: (originalRow, rowIndex) => get(originalRow, key),
      id: key,
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
            isIdColumn
          />
        ),
        id: "__id",
        accessor: "id",
        disableSortBy: true,
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

  useContextMenu(
    "CONVERT_NUMBER",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "number");
    },
    "rowContext"
  );

  useContextMenu(
    "CONVERT_STRING",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "string");
    },
    "rowContext"
  );

  useContextMenu(
    "CONVERT_BOOLEAN",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "boolean");
    },
    "rowContext"
  );

  useContextMenu(
    "CONVERT_MAP",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "map");
    },
    "rowContext"
  );

  useContextMenu(
    "CONVERT_ARRAY",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "array");
    },
    "rowContext"
  );

  useContextMenu(
    "CONVERT_TIME",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "timestamp");
    },
    "rowContext"
  );

  useContextMenu(
    "CONVERT_GEOPOINT",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "geopoint");
    },
    "rowContext"
  );

  useContextMenu(
    "CONVERT_NULL",
    ({ path, column }: { path: string; column: string }) => {
      actionSetFieldValue(path, column, "null");
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

  const handleSortColumn = useCallback(
    (sortBy) => {
      setRecoilExternalState(
        sorterAtom(collectionPath),
        sortBy.map((sorter) => ({
          id: uniqueId("sorter_"),
          field: sorter.id,
          sort: sorter.desc ? "desc" : "asc",
        }))
      );

      actionSubmitQuery();
    },
    [collectionPath]
  );

  return (
    <div className="w-full h-full mt-2 border-l border-r border-gray-300">
      <TableWrapper
        columns={columnViewer}
        data={data}
        onRowClick={handleRowClick}
        onSortColumn={handleSortColumn}
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

export default DataTable;
