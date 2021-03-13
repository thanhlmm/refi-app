import {
  ISorterEntity,
  navigatorCollectionPathAtom,
  sorterAtom,
} from "@/atoms/navigator";
import { actionAddSorter, actionRemoveSorter } from "@/atoms/navigator.action";
import { reorder } from "@/utils/common";
import React, { ReactElement, useEffect } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import ReactDOM from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { useRecoilState, useRecoilValue } from "recoil";
import FieldFinderInput from "../FieldFinderInput";

interface IPropertyItemProps {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  sorter: ISorterEntity;
  onRemove: (string) => void;
}

const SorterItem = ({
  snapshot,
  provided,
  sorter,
  onRemove,
}: IPropertyItemProps) => {
  const usePortal: boolean = snapshot.isDragging;

  const child: ReactElement = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="flex flex-row items-center justify-between h-8 hover:bg-gray-200 p-1.5 group"
    >
      <div>
        <svg
          className="inline-block w-4 opacity-0 group-hover:opacity-100"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
        {sorter.field} - {sorter.sort}
      </div>
      <button
        className="w-4 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(sorter.id)}
      >
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );

  if (!usePortal) {
    return child;
  }

  // if dragging - put the item in a portal
  return ReactDOM.createPortal(
    child,
    document.querySelector(".sorter-list-drag-portal") || document.body
  );
};

const SorterList = () => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const [sorterList, setSorterList] = useRecoilState(
    sorterAtom(collectionPath)
  );
  const { handleSubmit, reset, control, register } = useForm({
    defaultValues: { property: "" },
  });

  const handleDropEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newSorterOrder = reorder(
      sorterList,
      result.source.index,
      result.destination.index
    );

    setSorterList(newSorterOrder);
  };

  const handleRemoveSorter = (sorterId: string) => {
    actionRemoveSorter(collectionPath, sorterId);
  };

  const handleAddSorter = (value: any) => {
    actionAddSorter(collectionPath, value);
    reset();
  };

  useEffect(() => {
    if (!document.querySelector(".sorter-list-drag-portal")) {
      const portal: HTMLElement = document.createElement("div");
      portal.classList.add("sorter-list-drag-portal");
      document.body.appendChild(portal);
    }
  }, []);

  return (
    <div className="overflow-y-auto w-54">
      <form onSubmit={handleSubmit(handleAddSorter)}>
        <Controller
          control={control}
          name="field"
          defaultValue=""
          render={(
            { onChange, onBlur, value, name, ref },
            { invalid, isTouched, isDirty }
          ) => (
            <FieldFinderInput
              value={value}
              onChange={onChange}
              inputRef={ref as any}
            />
          )}
        />
        <select ref={register} name="sort">
          <option value="ASC">ASC</option>
          <option value="DESC">DESC</option>
        </select>
      </form>
      <div className="mt-2">
        <DragDropContext onDragEnd={handleDropEnd}>
          <Droppable droppableId="droppableSorterList">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {sorterList.map((sorter, index) => (
                  <Draggable
                    key={sorter.id}
                    draggableId={sorter.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <SorterItem
                        sorter={sorter}
                        provided={provided}
                        snapshot={snapshot}
                        onRemove={handleRemoveSorter}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default SorterList;
