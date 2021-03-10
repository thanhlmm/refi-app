import { cloneDeep } from "lodash";

const defaultOptions = {
  templateAttributeName: "cm-template",
  payloadAttributeName: "cm-payload",
  idAttributeName: "cm-id"
};

// Electron-specific; must match between main/renderer ipc
const contextMenuRequest = "ContextMenu-Request";
const contextMenuResponse = "ContextMenu-Response";
const contextMenuClicked = "ContextMenu-Clicked";

class ContextMenu {
  constructor(options) {
    this.options = defaultOptions;
    this.selectedElement = null;
    this.selectedElementAttributes = {};
    this.contextMenuParams = {};
    this.stagedInternalFnMap = {};
    this.internalFnMap = {};
    this.cleanedTemplates = {};

    // Merge any options the user passed in
    if (typeof options !== "undefined") {
      this.options = Object.assign(this.options, options);
    }
  }

  preloadBindings(ipcRenderer) {

    const createIpcBindings = () => {
      this.id = "";

      ipcRenderer.on(contextMenuRequest, (event, args) => {
        console.log(event, args);

        // Reset
        let templateToSend = null;
        this.selectedElement = null;
        this.selectedElementAttributes = {};
        this.contextMenuParams = args.params;

        // Grab the element where the user clicked
        this.selectedElement = document.elementFromPoint(args.params.x, args.params.y);
        if (this.selectedElement !== null) {

          const contextMenuTemplate = this.selectedElement.getAttribute(this.options.templateAttributeName);
          if (contextMenuTemplate !== "" && contextMenuTemplate !== null) {

            // Save all attribute values for later-use when
            // we call the callback defined for this context menu item
            const attributes = this.selectedElement.attributes;
            for (let i = 0; i < attributes.length; i++) {
              if (attributes[i].name.indexOf(this.options.payloadAttributeName) >= 0) {
                this.selectedElementAttributes[attributes[i].name.replace(`${this.options.payloadAttributeName}-`, "")] = attributes[i].value;
              } else if (attributes[i].name.indexOf(this.options.idAttributeName) >= 0) {
                this.id = attributes[i].value;
              }
            }

            templateToSend = contextMenuTemplate;
          }
        }

        // Send the request to the main process;
        // so the menu can get built
        ipcRenderer.send(contextMenuResponse, {
          id: this.id,
          params: args.params,
          template: templateToSend
        });
      });

      ipcRenderer.on(contextMenuClicked, (event, args) => {
        if (typeof this.internalFnMap[args.id] !== "undefined") {
          const payload = {
            params: this.contextMenuParams,
            attributes: this.selectedElementAttributes
          };
          this.internalFnMap[args.id](payload);
        }
      });
    };
    createIpcBindings();

    return {
      onReceive: (menuActionId, func, id) => {
        if (typeof id === "undefined") {
          this.internalFnMap[menuActionId] = func;
        } else {
          this.internalFnMap[`${id}___${menuActionId}`] = func;
        }
      },
      clearRendererBindings: () => {
        this.stagedInternalFnMap = {};
        this.internalFnMap = {};
        this.contextMenuParams = {};
        ipcRenderer.removeAllListeners(contextMenuRequest);
        ipcRenderer.removeAllListeners(contextMenuClicked);
        createIpcBindings();
      }
    }
  }

  mainBindings(ipcMain, browserWindow, Menu, isDevelopment, templates) {

    // Anytime a user right-clicks the browser window, send where they
    // clicked to the renderer process
    browserWindow.webContents.on("context-menu", (event, params) => {
      console.log(event);
      console.log(params);
      browserWindow.webContents.send(contextMenuRequest, {
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
              browserWindow.inspectElement(args.params.x, args.params.y);
            }
          });
        }

        if (args.template !== null) {

          // For any menu items that don't have a role or click event,
          // create one so we can tie back the click to the code!
          for (let i = 0; i < generatedContextMenu.length; i++) {
            if (typeof generatedContextMenu[i]["click"] === "undefined") {
              generatedContextMenu[i].click = function (event, window, webContents) {
                browserWindow.webContents.send(contextMenuClicked, {
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

      Menu.buildFromTemplate(generatedContextMenu).popup(browserWindow);
    });
  }

  clearMainBindings(ipcMain) {
    this.cleanedTemplates = {};
    ipcMain.removeAllListeners(contextMenuResponse);
  }
}

const contextMenu = new ContextMenu();
export default contextMenu;