import React from "react";
import classNames from "classnames";

interface IShortcutKeyProps {
  hotkey?: string;
  size?: "small" | "normal";
  title?: string;
}

const ShortcutKey = ({
  hotkey,
  size = "normal",
  title = "",
}: IShortcutKeyProps) => {
  if (!hotkey) {
    return null;
  }

  const keys = hotkey.split("+").map((key) => {
    if (key === "command") {
      return "⌘";
    }

    if (key === "shift") {
      return "⇧";
    }

    if (key === "option") {
      return "⌥";
    }

    if (key === "control" && window.os === "Darwin") {
      return "⌃";
    }

    if (key === "Enter") {
      return "Enter";
    }

    if (key === "Control") {
      return "Ctrl";
    }

    return key.toUpperCase();
  });

  return (
    <span>
      {title}
      {keys.map((key) => (
        <span
          key={key}
          className={classNames(
            "bg-gray-300 ml-1 rounded-sm inline-block text-center",
            {
              ["text-key font-bold p-0.5"]: size === "small",
              ["text-xs py-1 px-1.5"]: size === "normal",
            }
          )}
          style={{ minWidth: "1.5rem" }}
        >
          {key}
        </span>
      ))}
    </span>
  );
};

export default ShortcutKey;
