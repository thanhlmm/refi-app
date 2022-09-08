import {
  collectionWithQueryAtom,
  totalDocsWithQueryAtom,
} from "@/atoms/firestore";
import { actionNewDocument } from "@/atoms/firestore.action";
import { globalHotKeys } from "@/atoms/hotkeys";
import {
  navigatorCollectionPathAtom,
  querierAtom,
  queryVersionAtom,
} from "@/atoms/navigator";
import {
  actionAddFilter,
  actionQueryPage,
  actionSubmitQuery,
} from "@/atoms/navigator.action";
import { isModalPickProperty, isModalSorter } from "@/atoms/ui";
import DropdownMenu from "@/components/DropdownMenu";
import PropertyList from "@/components/PropertyList";
import { Button } from "@zendeskgarden/react-buttons";
import { TooltipModal } from "@zendeskgarden/react-modals";
import { Tooltip } from "@zendeskgarden/react-tooltips";
import classNames from "classnames";
import React, { useCallback, useMemo, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import ShortcutKey from "../ShortcutKey";
import SorterList from "../SorterList";
import FilterItem from "./FilterItem";

const NextButton = () => {
  const queryVersionData = useRecoilValue(queryVersionAtom);
  const docs = useRecoilValue(
    collectionWithQueryAtom(queryVersionData.collectionPath)
  );
  const handleClickNext = useCallback(() => {
    actionQueryPage(true);
  }, []);

  const isDisabled = useMemo(() => {
    if (docs.length === 0 && queryVersionData.startAfter) {
      return true;
    }

    return false;
  }, [docs.length, queryVersionData.startAfter]);

  return (
    <Button
      size="small"
      isBasic
      className={classNames("px-1", {
        ["pointer-events-none text-gray-300"]: isDisabled,
      })}
      onClick={handleClickNext}
    >
      Next
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
          d="M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619 4.357-4.357z"
        />
      </svg>
    </Button>
  );
};

const PreviousButton = () => {
  const queryVersionData = useRecoilValue(queryVersionAtom);
  const docs = useRecoilValue(
    collectionWithQueryAtom(queryVersionData.collectionPath)
  );
  const handleClickPrevious = useCallback(() => {
    actionQueryPage(false);
  }, []);

  const isDisabled = useMemo(() => {
    if (docs.length === 0 && queryVersionData.endBefore) {
      return true;
    }

    return false;
  }, [docs.length, queryVersionData.endBefore]);

  return (
    <Button
      size="small"
      isBasic
      className={classNames("px-1", {
        ["pointer-events-none text-gray-300"]: isDisabled,
      })}
      onClick={handleClickPrevious}
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
          d="M5.928 7.976l4.357 4.357-.618.62L5 8.284v-.618L9.667 3l.618.619-4.357 4.357z"
        />
      </svg>
      Previous
    </Button>
  );
};

const Filters = () => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const queryOptions = useRecoilValue(querierAtom(collectionPath));
  const [isShowPropertyList, setShowPropertyList] = useRecoilState(
    isModalPickProperty
  );

  const totalDocs = useRecoilValue(totalDocsWithQueryAtom(collectionPath));

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
        className: "dark:text-gray-200",
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
        <div className="space-x-2">
          <Button size="small" onClick={handleAddFilter}>
            Add Filters
          </Button>
          <Button
            size="small"
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
        <div className="flex flex-row items-center space-x-2">
          <div className="flex flex-row items-center">
            <div className="space-x-1 text-sm">
              <strong>{totalDocs}</strong> document(s)
            </div>
            <div className="flex flex-row items-center space-x-1">
              <PreviousButton />
              <NextButton />
            </div>
          </div>
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
              containerClassName="w-60 dark:bg-gray-50"
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
