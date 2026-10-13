import { cloneDeep } from "lodash";

// Must match client-preload.js
const contextMenuRequest = "ContextMenu-Request";
const contextMenuResponse = "ContextMenu-Response";
const contextMenuClicked = "ContextMenu-Clicked";

class ContextMenu {
  constructor() {
    this.cleanedTemplates = {};
  }

  mainBindings(ipcMain, view, mainWindow, Menu, isDevelopment, templates) {

    // Anytime a user right-clicks the browser window, send where they
    // clicked to the renderer process
    view.webContents.on("context-menu", (event, params) => {
      view.webContents.send(contextMenuRequest, {
        params
      });
    });

    ipcMain.on(contextMenuResponse, (IpcMainEvent, args) => {

      // id prepend; if we have a list of common elements,
      // certain bindings may not work because each element would have
      // registered for the same event name. In these cases, prepend each
      // menu item with the unique id passed in so that each individual
      // component can respond appropriately to the context menu action
      const idPrepend = args.id ? `${args.id}___` : "";
      const cleanedTemplatesKey = `${idPrepend}${args.template}`;

      let generatedContextMenu;
      if (args.template === null || typeof this.cleanedTemplates[cleanedTemplatesKey] === "undefined") {

        // Build our context menu based on our templates
        generatedContextMenu = templates[args.template] ? cloneDeep(templates[args.template]) : [];
        if (isDevelopment) {
          generatedContextMenu.push({
            label: "Inspect element",
            click: () => {
              view.webContents.inspectElement(args.params.x, args.params.y);
            }
          });
        }

        if (args.template !== null) {

          // For any menu items that don't have a role or click event,
          // create one so we can tie back the click to the code!
          for (let i = 0; i < generatedContextMenu.length; i++) {
            if (typeof generatedContextMenu[i]["click"] === "undefined") {
              generatedContextMenu[i].click = function (event, window, webContents) {
                view.webContents.send(contextMenuClicked, {
                  id: `${idPrepend}${(generatedContextMenu[i].id || generatedContextMenu[i].label)}`
                });
              }
            }
          }
        }

        // Save this cleaned template, so we can re-use it
        this.cleanedTemplates[cleanedTemplatesKey] = generatedContextMenu;
      }
      generatedContextMenu = this.cleanedTemplates[cleanedTemplatesKey];

      Menu.buildFromTemplate(generatedContextMenu).popup({ window: mainWindow });
    });
  }

  clearMainBindings(ipcMain) {
    this.cleanedTemplates = {};
    ipcMain.removeAllListeners(contextMenuResponse);
  }
}

const contextMenu = new ContextMenu();
export default contextMenu;