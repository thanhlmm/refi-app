import { Textarea } from "@zendeskgarden/react-forms";
import React, { useMemo } from "react";
import classNames from "classnames";

const DataInput = (props: any, ref) => {
  const isMultipleLine = useMemo(() => {
    return String(props.value)?.split("\n").length >= 2;
  }, [props.value]);

  const isVeryLong = String(props.value)?.length > 100;

  return (
    <Textarea
      {...props}
      ref={ref}
      isBare
      className={classNames(
        "w-full outline-none ring-inset focus:bg-blue-100 p-1.5 border-none focus:ring-0 text-gray-800",
        {
          ["h-8"]: isMultipleLine || isVeryLong,
        },
        props.className
      )}
    />
  );
};

export default React.forwardRef(DataInput);
