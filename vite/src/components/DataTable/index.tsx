import { navigatorPath } from "@/atoms/navigator";
import FieldViewer from "@/components/FieldViewer";
import { NSFireStore } from "@/types/FS";
import { getSampleColumn, isCollection, transformFSDoc } from "@/utils/common";
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
import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useRecoilState } from "recoil";
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
import { collectionAtom } from "@/atoms/firestore";
import { DocSnapshot } from "@/types/DocSnapshot";

function TableWrapper({
  columns,
  data,
  renderRowSubComponent,
}: {
  columns: any[];
  data: any[];
  renderRowSubComponent: Function;
}) {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
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
    totalColumnsWidth,
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
              return (
                <Cell {...cell.getCellProps()} isTruncated className="td">
                  {cell.render("Cell")}
                </Cell>
              );
            })}
          </Row>
          {row.isExpanded && (
            <Row className="tr">{renderRowSubComponent({ row })}</Row>
          )}
        </>
      );
    },
    [prepareRow, rows]
  );

  // Render the UI for your table
  const a = (
    <Table {...getTableProps()} className="table">
      <Head>
        {headerGroups.map((headerGroup: any) => (
          <HeaderRow {...headerGroup.getHeaderGroupProps()} className="tr">
            {headerGroup.headers.map((column: any) => (
              <SortableCell {...column.getHeaderProps()} className="th">
                {column.render("Header")}
              </SortableCell>
            ))}
          </HeaderRow>
        ))}
      </Head>

      <Body {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row);
          return RenderRow({ index });
        })}
        {/* <VariableSizeList
          height={600}
          itemCount={rows.length}
          // itemSize={getItemSize}
          itemSize={() => 35}
          width="100%"
        >
          {RenderRow}
        </VariableSizeList> */}
        {/* <AutoSizer>
          {({ height, width }) => (
            <VariableSizeList
              height={height}
              itemCount={rows.length}
              // itemSize={getItemSize}
              itemSize={() => 35}
              width={width}
            >
              {RenderRow}
            </VariableSizeList>
          )}
        </AutoSizer> */}
      </Body>
    </Table>
  );

  return (
    <Table {...getTableProps()} size="small" className="table">
      <Head>
        {headerGroups.map((headerGroup) => (
          <HeaderRow
            {...headerGroup.getHeaderGroupProps({
              // style: { paddingRight: '15px' },
            })}
            className="tr"
          >
            {headerGroup.headers.map((column) => (
              <HeaderCell {...column.getHeaderProps()} className="th">
                {column.render("Header")}
                {/* Use column.getResizerProps to hook up the events correctly */}
                {column.canResize && (
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${
                      column.isResizing ? "isResizing" : ""
                    }`}
                  />
                )}
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
                    <Cell {...cell.getCellProps()} className="td">
                      {cell.render("Cell")}
                    </Cell>
                  );
                })}
              </Row>
              {row.isExpanded && (
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
  const [path, setPath] = useRecoilState(navigatorPath);
  const [data, setData] = useRecoilState(collectionAtom(path));
  const [columns, setColumns] = useState<any[]>([]);

  const columnViewer = React.useMemo(() => {
    switch (true) {
      case data.length > 1:
        const sampleColumns = getSampleColumn(data);
        console.log({ data, sampleColumns });

        const docColumns = sampleColumns
          .sort((a, b) => a.localeCompare(b))
          .map((key) => ({
            Header: key,
            accessor: key,
            Cell: ({
              row,
              value,
              column,
            }: {
              row: any;
              value: any;
              column: any;
            }) => {
              return <EditableCell row={row.original} column={column} />;
            },
          }));

        return [
          {
            // Make an expander cell
            Header: () => "_id", // No header
            id: "__id", // It needs an ID
            accessor: "id",
            Cell: ({ value }) => <ReadOnlyField value={value} />,
          },
          {
            Header: () => null,
            id: "expander",
            Cell: ({ row }) => (
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
  }, [data]);

  useEffect(() => {
    const topicKey = `${path}.table`;
    const isCollectionType = isCollection(path);
    const listener = window.listen(topicKey, (response: string) => {
      if (isCollectionType) {
        const data = deserializeDocumentSnapshotArray(
          response,
          firebase.firestore.GeoPoint,
          firebase.firestore.Timestamp
        );

        setData(DocSnapshot.transformFromFirebase(data));
      } else {
        const data = deserializeDocumentSnapshot(
          response,
          firebase.firestore.GeoPoint,
          firebase.firestore.Timestamp
        );
        setData(DocSnapshot.transformFromFirebase([data]));
      }
    });
    const handler = isCollectionType
      ? "fs.queryCollection.subscribe"
      : "fs.queryDoc.subscribe";
    const id = window
      .send(handler, {
        topic: topicKey,
        path,
      })
      .then((a) => console.log(a));

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
        <code>{JSON.stringify({ values: row.values }, null, 2)}</code>
      </pre>
    ),
    []
  );

  return (
    <TableWrapper
      columns={columnViewer}
      data={data}
      renderRowSubComponent={renderRowSubComponent}
    />
  );
}

export default DataTable;
