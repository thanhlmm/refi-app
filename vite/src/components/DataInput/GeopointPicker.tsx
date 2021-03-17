import React from "react";

interface IGeopointPickerProps {
  value: firebase.firestore.GeoPoint;
  onChange: (value: firebase.firestore.GeoPoint) => void;
}

const GeopointPicker = ({ value, onChange }: IGeopointPickerProps) => {
  return (
    <div className="flex flex-row items-center px-1.5">
      {/* // TODO: Implement geo picker */}
      {/* <div className="w-6 p-1 cursor-pointer">
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div> */}
      <div className="flex flex-col">
        <div>
          <div className="inline-block w-10">lat </div>
          <input
            className="border-0 w-32 border-b border-gray-400 outline-none ring-0 p-0.5 focus:bg-blue-100 text-sm"
            name="lat"
            type="number"
            defaultValue={0}
            min={-90}
            max={90}
          />
        </div>
        <div>
          <div className="inline-block w-10">long </div>
          <input
            className="border-0 w-32 border-b border-gray-400 outline-none ring-0 p-0.5 focus:bg-blue-100 text-sm"
            name="long"
            type="number"
            defaultValue={0}
            min={-90}
            max={90}
          />
        </div>
      </div>
    </div>
  );
};

export default GeopointPicker;
