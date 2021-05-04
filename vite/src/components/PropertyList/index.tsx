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
import { Controller, useForm } from "react-hook-form";
import FieldFinderInput from "../FieldFinderInput";
import {
  actionAddProperty,
  actionRemoveProperty,
  actionSetProperty,
} from "@/atoms/navigator.action";
import { getSampleColumn, reorder } from "@/utils/common";
import classNames from "classnames";
import { Button } from "@zendeskgarden/react-buttons";
import { getRecoilExternalLoadable } from "@/atoms/RecoilExternalStatePortal";
import { collectionWithQueryAtom } from "@/atoms/firestore";

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
      className={classNames(
        "flex flex-row items-center justify-between h-8 hover:bg-gray-200 p-1.5 pl-0 group",
        {
          ["bg-gray-200"]: snapshot.isDragging,
        }
      )}
    >
      <div>
        <svg
          className="inline-block w-4 text-gray-500"
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
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
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
  const { handleSubmit, reset, control } = useForm({
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

  const handleResetFieldList = async () => {
    const data = await getRecoilExternalLoadable(
      collectionWithQueryAtom(collectionPath)
    ).toPromise();

    actionSetProperty(collectionPath, getSampleColumn(data));
  };

  return (
    <div className="w-54">
      <form
        onSubmit={handleSubmit(handleAddProperty)}
        className="p-0.5 flex flex-row space-x-2"
      >
        <div className="w-full">
          <Controller
            control={control}
            name="property"
            defaultValue=""
            render={({ onChange, value, ref }) => (
              <FieldFinderInput
                value={value}
                onChange={onChange}
                onSelect={(value) => handleAddProperty({ property: value })}
                inputRef={ref as any}
                placeholder="Add more property to table"
              />
            )}
          />
        </div>
        <Button onClick={handleResetFieldList} size="small">
          Reset
        </Button>
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
