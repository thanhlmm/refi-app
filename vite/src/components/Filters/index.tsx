import { actionNewDocument } from "@/atoms/firestore.action";
import { navigatorCollectionPathAtom, querierAtom } from "@/atoms/navigator";
import { actionAddFilter, actionSubmitQuery } from "@/atoms/navigator.action";
import { isModalPickProperty, isModalSorter } from "@/atoms/ui";
import PropertyList from "@/components/PropertyList";
import { Button, SplitButton } from "@zendeskgarden/react-buttons";
import { TooltipModal } from "@zendeskgarden/react-modals";
import React, { useMemo, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import DropdownMenu from "@/components/DropdownMenu";
import SorterList from "../SorterList";
import FilterItem from "./FilterItem";
import { Tooltip } from "@zendeskgarden/react-tooltips";
import ShortcutKey from "../ShortcutKey";
import { globalHotKeys } from "@/atoms/hotkeys";

const Filters = () => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const queryOptions = useRecoilValue(querierAtom(collectionPath));
  const [isShowPropertyList, setShowPropertyList] = useRecoilState(
    isModalPickProperty
  );

  const [isShowSorterList, setShowSorterList] = useRecoilState(isModalSorter);
  const propertyBtnRef = useRef<HTMLButtonElement>(null);
  const sorterBtnRef = useRef<HTMLButtonElement>(null);

  const handleAddFilter = () => {
    actionAddFilter("", "==", collectionPath);
  };

  const queryMenu = useMemo(() => {
    return [
      {
        title: "Without filter",
        hotkey: globalHotKeys.SEND_QUERY_WITHOUT_FILTER.sequences,
        onClick: () => {
          actionSubmitQuery(false);
        },
      },
    ];
  }, []);

  return (
    <div className="space-y-2">
      {queryOptions.map((filter) => (
        <FilterItem key={filter.id} id={filter.id}></FilterItem>
      ))}
      <div className="flex justify-between">
        <div>
          <Button size="small" isBasic onClick={handleAddFilter}>
            Add Filters
          </Button>
          <Button
            size="small"
            isBasic
            ref={propertyBtnRef}
            onClick={() => {
              setShowPropertyList(true);
            }}
            className={isShowPropertyList ? "bg-blue-100" : ""}
          >
            Properties
          </Button>

          <TooltipModal
            referenceElement={
              isShowPropertyList ? propertyBtnRef.current : null
            }
            onClose={() => setShowPropertyList(false)}
            placement="bottom-start"
            className="p-2 leading-normal"
            hasArrow={false}
            isAnimated={false}
          >
            <PropertyList />
          </TooltipModal>

          {/* <Button
            size="small"
            isBasic
            ref={sorterBtnRef}
            onClick={() => {
              setShowSorterList(true);
            }}
          >
            Sort
          </Button> */}

          <TooltipModal
            referenceElement={isShowSorterList ? sorterBtnRef.current : null}
            onClose={() => setShowSorterList(false)}
            placement="bottom-start"
            className="p-3 leading-normal"
          >
            <SorterList />
          </TooltipModal>
        </div>
        <div className="flex flex-row space-x-2">
          <Tooltip
            placement="bottom"
            appendToNode={document.body}
            zIndex={40}
            delayMS={100}
            hasArrow={false}
            size="medium"
            type="light"
            className="max-w-2xl p-2"
            content={
              <ShortcutKey
                size="small"
                hotkey={globalHotKeys.NEW_DOCUMENT.sequences}
              />
            }
          >
            <Button
              size="small"
              onClick={() => actionNewDocument(collectionPath)}
            >
              New document
            </Button>
          </Tooltip>
          <div className="flex flex-row">
            <Tooltip
              placement="bottom"
              appendToNode={document.body}
              zIndex={40}
              delayMS={100}
              hasArrow={false}
              size="medium"
              type="light"
              className="max-w-2xl p-2"
              content={
                <ShortcutKey
                  size="small"
                  hotkey={globalHotKeys.SEND_QUERY.sequences}
                />
              }
            >
              <Button
                size="small"
                isPrimary
                onClick={() => actionSubmitQuery(true)}
              >
                Query
              </Button>
            </Tooltip>
            <DropdownMenu
              menu={queryMenu}
              placement="bottom-end"
              className="ml-px"
              containerClassName="w-60"
            >
              <Button size="small" isPrimary className="px-0.5">
                <svg
                  className="w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
