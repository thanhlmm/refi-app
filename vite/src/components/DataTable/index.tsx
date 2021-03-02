import { collectionAtom, storeDocs } from "@/atoms/firestore";
import {
  navigatorCollectionPathAtom,
  navigatorPathAtom,
} from "@/atoms/navigator";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getSampleColumn } from "@/utils/common";
import firebase from "firebase";
import "firebase/firestore";
import { deserializeDocumentSnapshotArray } from "firestore-serializers";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useBlockLayout,
  useExpanded,
  useFlexLayout,
  useResizeColumns,
  useTable,
} from "react-table";
import { FixedSizeList } from "react-window";
import { useRecoilValue, useSetRecoilState } from "recoil";
import EditableCell, { ReadOnlyField } from "../EditableCell";
import scrollbarWidth from "./scroll-bar-width";

function TableWrapper({
  columns,
  data,
  renderRowSubComponent,
  onRowClick,
}: {
  columns: any[];
  data: ClientDocumentSnapshot[];
  renderRowSubComponent: Function;
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
    },
    // useBlockLayout
    // useResizeColumns,
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
                {...column.getHeaderProps()}
                className="text-left text-gray-500 border-r border-gray-200 px-1.5 py-1"
              >
                {column.render("Header")}
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

function DataTable() {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const setPath = useSetRecoilState(navigatorPathAtom);
  const data = useRecoilValue(collectionAtom(collectionPath));
  const [columns, setColumns] = useState<any[]>([]); // Let user decision which columns to keep

  const columnViewer = React.useMemo(() => {
    if (data.length) {
      const sampleColumns = getSampleColumn(data);

      const docColumns = sampleColumns
        .sort((a, b) => a.localeCompare(b))
        .map((key, index) => ({
          Header: key,
          accessor: key,
          Cell: ({ row, column }: { row: any; column: any }) => {
            return (
              <EditableCell
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
            <div className="w-5 text-gray-400">
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
    }

    return [];
  }, [data]);

  useEffect(() => {
    if (collectionPath === "/") {
      // TODO: Show empty state for choosing collection on the left side
      return;
    }

    const topicKey = `${collectionPath}.table`;

    const listener = window.listen(topicKey, (response: string) => {
      const data = deserializeDocumentSnapshotArray(
        response,
        firebase.firestore.GeoPoint,
        firebase.firestore.Timestamp
      );

      storeDocs(ClientDocumentSnapshot.transformFromFirebase(data));
    });
    const id = window.send("fs.queryCollection.subscribe", {
      topic: topicKey,
      path: collectionPath,
    });

    return () => {
      listener();
      window.send("fs.unsubscribe", {
        id,
      });
    };
  }, [collectionPath]);

  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <pre
        style={{
          fontSize: "10px",
        }}
      >
        <code>
          {JSON.stringify({ values: row?.original?.data() }, null, 2)}
        </code>
      </pre>
    ),
    []
  );

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
        renderRowSubComponent={renderRowSubComponent}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

export default DataTable;
