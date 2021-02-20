import React, { useEffect, useState } from "react";

function getFieldType(value: any): string {
  const fieldType = typeof value;
  switch (fieldType) {
    case "string":
    case "number":
    case "boolean":
      return fieldType;
    case "object":
      if (value?._latitude && value?._longitude) {
        return "geopoint";
      }

      if (value === null) {
        return "null";
      }

      if (Array.isArray(value)) {
        return "array";
      }

      // Ref case

      return "map";
  }

  return "object";
}

const fieldValueMapper: Record<string, Function> = {
  String: ({ value }: { value: string }) => <div>{value}</div>,
  Number: ({ value }: { value: number }) => <div>No: {value}</div>,
  Boolean: ({ value }: { value: boolean }) => <div>Value: {String(value)}</div>,
  Map: ({ value }: { value: any }) => <div>{JSON.stringify(value)}</div>,
  Geopoint: ({ value }: { value: any }) => (
    <div>Geopoint {JSON.stringify(value)}</div>
  ),
  Array: ({ value }: { value: any[] }) => (
    <div>Array {JSON.stringify(value)}</div>
  ),
  Timestamp: ({
    value: { _seconds, _nanoseconds },
  }: {
    value: { _seconds: number; _nanoseconds: number };
  }) => (
    <div>Time {new Date(_seconds * 1000 + _nanoseconds).toISOString()}</div>
  ),
};

// TODO: Implement highlight when update here
function FieldViewer({ value, type = "Map" }: { value: any; type?: string }) {
  const [isUpdated, setUpdated] = useState(false);

  // useEffect(() => {
  //   setUpdated(true);
  //   // console.log("updated", value);
  //   setTimeout(() => {
  //     setUpdated(false);
  //   }, 5000);
  // }, [value, type]);

  if (typeof value === "undefined") {
    return null;
  }

  const FieldComp = fieldValueMapper[type] || fieldValueMapper["Map"];
  return (
    <div className={isUpdated ? "updated" : ""}>
      <FieldComp value={value} />
    </div>
  );
}

export default React.memo(FieldViewer);
