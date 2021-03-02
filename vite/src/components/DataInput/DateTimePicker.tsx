import dayjs from "dayjs";
import firebase from "firebase";
import React, { ReactElement, useEffect, useState } from "react";
import MaskedField from "react-masked-field";

const format = "MM/DD/YYYY HH:mm:ss";

interface DateTimePicker {
  value: firebase.firestore.Timestamp;
  onChange: (string) => void;
}

const transferTime = (value: firebase.firestore.Timestamp): string => {
  return dayjs(value.toDate()).format(format);
};

const DateTimePicker = ({ value, onChange }: DateTimePicker): ReactElement => {
  const [instanceValue, setInstanceValue] = useState(transferTime(value));

  const handleSelectNow = () => {
    onChange(firebase.firestore.Timestamp.now());
  };

  const handleVerifyOutput = (value: string) => {
    const dateValue = dayjs(value, format);
    if (dateValue.isValid()) {
      onChange(dateValue.toDate());
    }
  };

  // Sync data
  useEffect(() => {
    const newValue = transferTime(value);
    if (newValue !== instanceValue) {
      setInstanceValue(newValue);
    }
  }, [value]);

  // NOTICE: Use input[type="datetime-local"] />

  return (
    <div>
      <MaskedField
        mask="99/99/9999 99:99:99"
        placeholder={format}
        onComplete={handleVerifyOutput}
        value={instanceValue}
        className="border-none outline-none p-1.5 h-full w-full focus:ring-0 focus:bg-blue-100 text-sm"
      />

      <button
        role="button"
        className="p-1 text-xs bg-white border border-gray-300 rounded shadow-sm"
        onClick={handleSelectNow}
      >
        Now
      </button>
    </div>
  );
};

export default DateTimePicker;
