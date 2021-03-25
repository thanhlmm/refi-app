import React, { useEffect, useState } from "react";
import { useCopyToClipboard } from "react-use";
import classNames from "classnames";

interface ICopyIconProps {
  value: string | number;
  className: string;
}

const CopyIcon = ({ value, className }: ICopyIconProps) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    if (copyStatus) {
      setTimeout(() => {
        setCopyStatus(false);
      }, 1000);
    }
  }, [copyStatus]);

  const handleCopy: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    copyToClipboard(value.toString());
    setCopyStatus(true);
  };

  return (
    <button onClick={handleCopy} className={classNames("w-5", className)}>
      {copyStatus ? (
        <svg
          className="text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : (
        <svg
          className="text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      )}
    </button>
  );
};

export default CopyIcon;
