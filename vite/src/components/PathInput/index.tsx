import React from "react";
import { navigatorPath } from "@/atoms/navigator";
import { KeyboardEvent, ChangeEvent, useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { Input } from "@zendeskgarden/react-forms";

function PathInput() {
  const [path, setPath] = useRecoilState(navigatorPath);
  const [pathInput, setPathInput] = useState(path);

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setPathInput(e.target.value);
  };

  const handlePathChange = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPath(pathInput);
    }
  };

  useEffect(() => {
    setPathInput(path);
  }, [path]);

  return (
    <div>
      <Input
        isCompact
        value={pathInput}
        onChange={handleChangeValue}
        onKeyDown={handlePathChange}
      />
    </div>
  );
}

export default PathInput;
