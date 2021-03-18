import {
  navigatorCollectionPathAtom,
  propertyListAtom,
} from "@/atoms/navigator";
import React, { ReactElement, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
} from "react-beautiful-dnd";
import ReactDOM from "react-dom";
import { Input } from "@zendeskgarden/react-forms";
import { Controller, useForm } from "react-hook-form";
import FieldFinderInput from "../FieldFinderInput";
import {
  actionAddProperty,
  actionRemoveProperty,
} from "@/atoms/navigator.action";
import { reorder } from "@/utils/common";

interface IPropertyItemProps {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  property: string;
  onRemove: (string) => void;
}

const PropertyItem = ({
  snapshot,
  provided,
  property,
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
        {property}
      </div>
      <button
        className="w-4 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(property)}
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
    document.querySelector(".property-list-drag-portal") || document.body
  );
};

const PropertyList = () => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const [propertyList, setPropertyList] = useRecoilState(
    propertyListAtom(collectionPath)
  );
  const { handleSubmit, reset, control, getValues } = useForm({
    defaultValues: { property: "" },
  });

  const handleDropEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newPropertyOrder = reorder(
      propertyList,
      result.source.index,
      result.destination.index
    );

    setPropertyList(newPropertyOrder);
  };

  const handleRemoveProperty = (property: string) => {
    actionRemoveProperty(collectionPath, property);
  };

  const handleAddProperty = ({ property }: { property: string }) => {
    actionAddProperty(collectionPath, property);
    reset();
  };

  useEffect(() => {
    if (!document.querySelector(".property-list-drag-portal")) {
      const portal: HTMLElement = document.createElement("div");
      portal.classList.add("property-list-drag-portal");
      document.body.appendChild(portal);
    }
  }, []);

  return (
    <div className="w-54">
      <form onSubmit={handleSubmit(handleAddProperty)} className="p-0.5">
        <Controller
          control={control}
          name="property"
          defaultValue=""
          render={(
            { onChange, onBlur, value, name, ref },
            { invalid, isTouched, isDirty }
          ) => (
            <FieldFinderInput
              value={value}
              onChange={onChange}
              inputRef={ref as any}
              placeholder="Add more property to table"
            />
          )}
        />
      </form>
      <div className="mt-2 overflow-y-auto max-h-60">
        <DragDropContext onDragEnd={handleDropEnd}>
          <Droppable droppableId="droppablePropertyList">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {propertyList.map((property, index) => (
                  <Draggable
                    key={property}
                    draggableId={property}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <PropertyItem
                        property={property}
                        provided={provided}
                        snapshot={snapshot}
                        onRemove={handleRemoveProperty}
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

export default PropertyList;
