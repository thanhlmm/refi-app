import { atom } from "recoil";

interface ICommandRegister {
  name: string;
  hotkey: string;
}

export const commandsAtom = atom<ICommandRegister[]>({
  key: "commandsAtom",
  default: [],
});
