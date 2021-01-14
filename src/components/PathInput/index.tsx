import { navigatorPath } from "@/atoms/navigator";
import { KeyboardEvent, ChangeEvent, useState, useEffect } from "react";
import { useRecoilState } from "recoil";

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
      <input
        name="pathInput"
        type="text"
        value={pathInput}
        onChange={handleChangeValue}
        onKeyDown={handlePathChange}
        className="block w-full mt-1 bg-gray-100 border-transparent rounded focus:border-gray-500 focus:bg-white focus:ring-0"
      ></input>
    </div>
  );
}

export default PathInput;
