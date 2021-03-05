import React, { useEffect, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { HotKeys } from "react-hotkeys";

const people = [
  "Wade Cooper",
  "Arlene Mccoy",
  "Devon Webb",
  "Tom Cook",
  "Tanya Fox",
  "Hellen Schmidt",
  "Caroline Schultz",
  "Mason Heaney",
  "Claudie Smitham",
  "Emil Schaefer",
];

const handlers = {
  MOVE_UP: (event) => console.log("Move up hotkey called!"),
};

export default function () {
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const optionRef = useRef<any>(null);

  // useEffect(() => {
  //   setTimeout(() => {
  //     optionRef.current?.focus();
  //     console.log("setted", optionRef.current);
  //   }, 1000);
  // });

  return (
    // <HotKeys
    //   keyMap={
    //     {
    //       MOVE_UP: "up",
    //     } as any
    //   }
    //   handlers={handlers}
    //   allowChanges
    // >
    <input className="border-2 border-gray-400" />
    // </HotKeys>
  );
}
