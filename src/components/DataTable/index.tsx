import React, { useEffect, useState } from "react";
import { useTable, useBlockLayout } from "react-table";
import { FixedSizeList } from "react-window";
import scrollbarWidth from "./scroll-bar-width";
import FieldViewer from "@/components/FieldViewer";
import { navigatorPath } from "@/atoms/navigator";
import { useRecoilState } from "recoil";
import { isCollection } from "@/utils/common";

interface IUser extends Record<string, any> {
  username: string;
  gender: string;
}

function Table({ columns, data }: { columns: any[]; data: any[] }) {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
      width: 150,
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
    useBlockLayout
  );

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className="tr"
        >
          {row.cells.map((cell: any) => {
            return (
              <div {...cell.getCellProps()} className="td">
                {cell.render("Cell")}
              </div>
            );
          })}
        </div>
      );
    },
    [prepareRow, rows]
  );

  // Render the UI for your table
  return (
    <div {...getTableProps()} className="table">
      <div>
        {headerGroups.map((headerGroup: any) => (
          <div {...headerGroup.getHeaderGroupProps()} className="tr">
            {headerGroup.headers.map((column: any) => (
              <div {...column.getHeaderProps()} className="th">
                {column.render("Header")}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div {...getTableBodyProps()}>
        <FixedSizeList
          height={400}
          itemCount={rows.length}
          itemSize={35}
          width={totalColumnsWidth + scrollBarSize}
        >
          {RenderRow}
        </FixedSizeList>
      </div>
    </div>
  );
}

function DataTable() {
  const [data, setData] = useState<IUser[]>([]);
  const [path, setPath] = useRecoilState(navigatorPath);

  const columns = React.useMemo(() => {
    if (data?.length > 0) {
      // TODO: Sort column by alphabet like firebase
      return Object.keys(data[0])
        .filter((key) => key !== "__METADATA")
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
            return (
              <FieldViewer
                value={value}
                type={row?.original?.__METADATA?.type?.[column.id] || "Object"}
              />
            );
          },
        }));
    }

    return [];
  }, [data]);

  useEffect(() => {
    const topicKey = `${path}.table`;
    const isCollectionType = isCollection(path);
    const listener = window.listen(topicKey, (data: any) => {
      if (isCollectionType) {
        setData(data as IUser[]);
      } else {
        console.log(data);
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

    console.log({
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

  return <Table columns={columns} data={data} />;
}

export default DataTable;
