import { navigatorPathAtom } from "@/atoms/navigator";
import { getSampleColumn, isCollection } from "@/utils/common";
import firebase from "firebase";
import "firebase/firestore";
import {
  deserializeDocumentSnapshot,
  deserializeDocumentSnapshotArray,
} from "firestore-serializers";
import React, { useEffect, useState } from "react";
import {
  useFlexLayout,
  useTable,
  useExpanded,
  useResizeColumns,
} from "react-table";
import { useRecoilState, useRecoilValue } from "recoil";
import scrollbarWidth from "./scroll-bar-width";

import {
  Body,
  Cell,
  Head,
  HeaderCell,
  HeaderRow,
  SortableCell,
  Row,
  Table,
} from "@zendeskgarden/react-tables";
import EditableCell, { ReadOnlyField } from "../EditableCell";
import { collectionAtom, storeDocs } from "@/atoms/firestore";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";

function TableWrapper({
  columns,
  data,
  renderRowSubComponent,
}: {
  columns: any[];
  data: ClientDocumentSnapshot[];
  renderRowSubComponent: Function;
}) {
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 100, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    []
  );

  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

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
    useResizeColumns,
    useFlexLayout,
    useExpanded
  );

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <>
          <Row
            {...row.getRowProps({
              style,
            })}
            className="tr"
          >
            {row.cells.map((cell) => {
              const cellProps = cell.getCellProps();
              return (
                <Cell
                  {...cellProps}
                  key={cellProps.key}
                  isTruncated
                  className="td"
                >
                  {cell.render("Cell")}
                </Cell>
              );
            })}
          </Row>
          {(row as any).isExpanded && (
            <Row className="tr">{renderRowSubComponent({ row })}</Row>
          )}
        </>
      );
    },
    [prepareRow, rows]
  );

  // Render the UI for your table
  return (
    <Table {...getTableProps()} size="small" className="table">
      <Head>
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <HeaderRow
            {...headerGroup.getHeaderGroupProps({
              // style: { paddingRight: '15px' },
            })}
            className="tr"
          >
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <HeaderCell {...column.getHeaderProps()} className="th">
                {column.render("Header")}
                {/* TODO: Integrate column resize */}
                {/* Use column.getResizerProps to hook up the events correctly */}
                {/* {column.canResize && (
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${
                      column.isResizing ? "isResizing" : ""
                    }`}
                  />
                )} */}
              </HeaderCell>
            ))}
          </HeaderRow>
        ))}
      </Head>
      <Body className="tbody">
        {rows.map((row) => {
          prepareRow(row);
          return (
            <>
              <Row {...row.getRowProps()} className="tr">
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <Cell {...cell.getCellProps()} className="td">
                      {cell.render("Cell")}
                    </Cell>
                  );
                })}
              </Row>
              {(row as any).isExpanded && (
                <Row className="tr">{renderRowSubComponent({ row })}</Row>
              )}
            </>
          );
        })}
      </Body>
    </Table>
  );
}

function DataTable() {
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  const data = useRecoilValue(collectionAtom(path));
  const [columns, setColumns] = useState<any[]>([]); // Let user decision which columns to keep

  const columnViewer = React.useMemo(() => {
    switch (true) {
      case data.length > 1:
        const sampleColumns = getSampleColumn(data);

        const docColumns = sampleColumns
          .sort((a, b) => a.localeCompare(b))
          .map((key, index) => ({
            Header: key,
            accessor: key,
            Cell: ({ row, column }: { row: any; column: any }) => {
              return (
                <EditableCell
                  row={row.original}
                  column={column}
                  tabIndex={row.index * row.cells.length + index}
                />
              );
            },
          }));

        return [
          {
            Header: () => "_id",
            id: "__id",
            accessor: "id",
            Cell: ({ value }: { value: any }) => (
              <ReadOnlyField value={value} />
            ),
          },
          {
            Header: () => null,
            id: "expander",
            Cell: ({ row }: { row: any }) => (
              <span {...row.getToggleRowExpandedProps()}>
                {row.isExpanded ? "👇" : "👉"}
              </span>
            ),
          },
          ...docColumns,
        ];
      case data.length === 1:
        // return Object.keys(data[0]);
        return [];
      default:
        return [];
    }
  }, [data.length, path]);

  useEffect(() => {
    if (path === "/") {
      // TODO: Show empty state for choosing collection on the left side
      return;
    }

    const topicKey = `${path}.table`;
    const isCollectionType = isCollection(path);
    const listener = window.listen(topicKey, (response: string) => {
      if (isCollectionType) {
        const data = deserializeDocumentSnapshotArray(
          response,
          firebase.firestore.GeoPoint,
          firebase.firestore.Timestamp
        );

        storeDocs(ClientDocumentSnapshot.transformFromFirebase(data));
      } else {
        const data = deserializeDocumentSnapshot(
          response,
          firebase.firestore.GeoPoint,
          firebase.firestore.Timestamp
        );
        storeDocs(ClientDocumentSnapshot.transformFromFirebase([data]));
      }
    });
    const handler = isCollectionType
      ? "fs.queryCollection.subscribe"
      : "fs.queryDoc.subscribe";
    const id = window.send(handler, {
      topic: topicKey,
      path,
    });

    return () => {
      listener();
      window.send("fs.unsubscribe", {
        id,
      });
    };
  }, [path]);

  // const tableData = data.map((row) => transformFSDoc(row));

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

  return (
    <div className="overflow-auto">
      <TableWrapper
        columns={columnViewer}
        data={data}
        renderRowSubComponent={renderRowSubComponent}
      />
    </div>
  );
}

export default DataTable;
