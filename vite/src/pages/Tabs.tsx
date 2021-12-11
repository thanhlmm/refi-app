import React, { useEffect, useState } from "react";
import { Tabs, TabList, Tab } from "@zendeskgarden/react-tabs";
import classNames from "classnames";
// import BrowserView from "react-electron-browser-view";

const TabsPage = () => {
  const [selectedTab, setSelectedTab] = useState("tab-1");
  const [tabList, setTabList] = useState<string[]>([]);

  const handleSelectTab = (tabName: string) => {
    if (tabName === "add") {
      window.api.newTab(window.location.href);
      return;
    }

    window.api.setTab(tabName);
  };

  useEffect(() => {
    getInitTab();
    window.api.onTabChange((data) => {
      setTabList(data.tabs);
      setSelectedTab(data.active);
    });
  }, []);

  const getInitTab = async () => {
    const data = await window.api.getTabs();
    setTabList(data.tabs);
    setSelectedTab(data.active);
  };

  const handleCloseTab = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    e.stopPropagation();

    window.api.closeTab(tab);
  };

  const handleCloseWindow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.api.closeWindow();
  };

  const handleMinimumWindow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.api.minimumWindow();
  };

  const handleToggleMaximumWindow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.api.toggleMaximumWindow();
  };

  const isMacOS = window.os === "darwin" || window.os === "Darwin";
  // const isMacOS = false;

  return (
    <div className="flex flex-col h-screen">
      <div
        className={classNames("flex flex-row justify-between h-9", {
          ["mr-30"]: !isMacOS,
          ["ml-20"]: isMacOS,
        })}
        id="drag-title"
        onDoubleClick={handleToggleMaximumWindow}
      >
        <Tabs selectedItem={selectedTab} onChange={handleSelectTab}>
          <TabList
            className={classNames("box-content m-0 border-b-0", {
              ["bg-gray-500"]: !isMacOS,
              ["bg-gray-300"]: isMacOS,
            })}
          >
            {tabList.map((tab) => (
              <Tab
                item={tab}
                key={tab}
                className={classNames(
                  "py-2 px-8 border-0 text-left group relative",
                  {
                    ["bg-white"]: tab === selectedTab,
                    ["text-white"]: !isMacOS && tab !== selectedTab,
                    ["text-gray-600"]: isMacOS && tab !== selectedTab,
                  }
                )}
              >
                {tab}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="absolute transform -translate-y-1/2 opacity-0 right-2 top-1/2 group-hover:opacity-100"
                  onClick={(e) => handleCloseTab(e, tab)}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
                  />
                </svg>
              </Tab>
            ))}
            <Tab
              item="add"
              className={classNames("px-3 py-2 border-0", {
                ["text-white"]: !isMacOS,
                ["text-gray-600"]: isMacOS,
              })}
            >
              <svg
                width="18"
                height="20"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z" />
              </svg>
            </Tab>
          </TabList>
        </Tabs>
        {!isMacOS && (
          <div className="flex flex-row items-stretch justify-center">
            <div
              className="p-3 hover:bg-gray-600"
              onClick={handleMinimumWindow}
            >
              <img
                className="icon"
                srcSet="icons/min-w-10.png 1x, icons/min-w-12.png 1.25x, icons/min-w-15.png 1.5x, icons/min-w-15.png 1.75x, icons/min-w-20.png 2x, icons/min-w-20.png 2.25x, icons/min-w-24.png 2.5x, icons/min-w-30.png 3x, icons/min-w-30.png 3.5x"
                draggable="false"
              />
            </div>

            <div
              className="p-3 hover:bg-gray-600"
              onClick={handleToggleMaximumWindow}
            >
              <img
                className="icon"
                srcSet="icons/max-w-10.png 1x, icons/max-w-12.png 1.25x, icons/max-w-15.png 1.5x, icons/max-w-15.png 1.75x, icons/max-w-20.png 2x, icons/max-w-20.png 2.25x, icons/max-w-24.png 2.5x, icons/max-w-30.png 3x, icons/max-w-30.png 3.5x"
                draggable="false"
              />
            </div>

            <div className="p-3 hover:bg-red-600" onClick={handleCloseWindow}>
              <img
                className="icon"
                srcSet="icons/close-w-10.png 1x, icons/close-w-12.png 1.25x, icons/close-w-15.png 1.5x, icons/close-w-15.png 1.75x, icons/close-w-20.png 2x, icons/close-w-20.png 2.25x, icons/close-w-24.png 2.5x, icons/close-w-30.png 3x, icons/close-w-30.png 3.5x"
                draggable="false"
              />
            </div>
          </div>
        )}
      </div>
      <div className="w-full h-full bg-white"></div>
    </div>
  );
};

export default TabsPage;
