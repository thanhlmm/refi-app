import React from "react";
import classNames from "classnames";

interface IShortcutKeyProps {
  hotkey: string | string[];
  size?: "small" | "normal";
  title?: string;
}

const ShortcutKey = ({
  hotkey,
  size = "normal",
  title = "",
}: IShortcutKeyProps) => {
  const keys = (Array.isArray(hotkey) ? hotkey[0] : hotkey)
    .split("+")
    .map((key) => {
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

      if (key === "Add") {
        return "+";
      }

      if (key === "Subtract") {
        return "-";
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
