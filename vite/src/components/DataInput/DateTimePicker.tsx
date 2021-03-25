import classNames from "classnames";
import firebase from "firebase/app";
import moment from "moment";
import React, { ReactElement, useState } from "react";
import * as DatetimeModule from "react-datetime";
const Datetime =
  process.env.NODE_ENV === "production"
    ? (DatetimeModule as any).default.default
    : (DatetimeModule as any).default;
import "./DateTimePicker.css";

interface IDateTimePickerProps {
  value: firebase.firestore.Timestamp;
  onChange: (newValue: firebase.firestore.Timestamp) => void;
}

const dateFormat = "MM/DD/YYYY";
const timeFormat = "HH:mm:ss";
const format = `${dateFormat} ${timeFormat}`;

const DateTimePicker = ({
  value,
  onChange,
}: IDateTimePickerProps): ReactElement => {
  const [isValid, setValid] = useState(true);

  const handleOnTimeChange = (newValue: string | moment.Moment) => {
    setValid(typeof newValue !== "string");
  };

  const handleOnClose = (event: string | Event | moment.Moment) => {
    if (moment.isMoment(event)) {
      if (
        moment(value.toDate()).format(format) !== moment(event).format(format)
      ) {
        onChange(firebase.firestore.Timestamp.fromDate(event.toDate()));
      }
    }
  };

  return (
    <Datetime
      closeOnSelect
      initialValue={value.toDate()}
      onChange={handleOnTimeChange}
      onClose={handleOnClose as any}
      dateFormat={dateFormat}
      timeFormat={timeFormat}
      className="h-full"
      inputProps={{
        className: classNames(
          "w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5 border-none focus:ring-1 text-sm text-gray-800 bg-transparent",
          {
            ["focus:ring-red-400"]: !isValid,
            ["focus:ring-blue-400"]: isValid,
          }
        ),
      }}
    />
  );
};

export default DateTimePicker;
