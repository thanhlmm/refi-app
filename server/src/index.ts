import isDev from "electron-is-dev";
import log from 'electron-log';
import { autoUpdater } from "electron-updater"
// import todesktop from "@todesktop/runtime";
if (isDev) {
  require('source-map-support').install();
}

// todesktop.init({
//   customLogger: log,
//   autoUpdater: true
// });

if (!isDev) {
  log.transports.file.level = "verbose";
}

process.on('unhandledRejection', log.error);

import { app, BrowserWindow, ipcMain, Menu, dialog, WebContentsView, globalShortcut, MenuItem, shell, utilityProcess, MessageChannelMain, UtilityProcess } from 'electron';
import * as path from 'path';
import fs from 'fs';
import db from './client/db';
import ContextMenu from './lib/electron-context-menu'
import { contextConfig } from './contextMenu';
import serve from 'electron-serve';
import { uniqueId } from "lodash";
// import { needConfirm, setConfirmReload, shouldConfirm } from "./lib/confirmReload";

serve({ directory: 'build' });
app.disableHardwareAcceleration()

interface IWindowInstance {
  view: WebContentsView;
  serverProcess: UtilityProcess | null;
  workerReady: boolean;
  workerExited: boolean;
  connectRequested: boolean;
  name: string;
}

let listWindow: IWindowInstance[] = [];

let mainWindow: BrowserWindow;

let activeInstance: IWindowInstance | null = null;

const isMacOS = process.platform === 'darwin';
// const isMacOS = false;

const canOpenExternally = (url: string) => {
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

if (!isDev) {
  const server = "https://refi-updater.vercel.app";
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`

  // autoUpdater.setFeedURL({ url: feed, serverType: "json" })

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60000);

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    log.debug('Downloaded new update');
    const dialogOpts = {
      type: 'info' as const,
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', message => {
    log.error('There was a problem updating the application')
    log.error(message)
  })
}

const createMainWindow = async () => {
  if (mainWindow) {
    return mainWindow;
  }
  const window = new BrowserWindow({
    show: false,
    width: 1000,
    height: 1000,
    backgroundColor: isMacOS ? "#D1D5DB" : "#6B7280",
    icon: path.join(__dirname, '../assets/icon.icns'),
    titleBarStyle: isMacOS ? 'hiddenInset' : 'default',
    frame: isMacOS,
    webPreferences: {
      devTools: isDev,
      // enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: __dirname + "/tab-preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  mainWindow = window;

  if (isDev) {
    // mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  window.on('closed', () => {
    mainWindow = null;
    activeInstance = null;
    listWindow.forEach(releaseInstance);
    listWindow = [];
  })

  window.on('resize', layoutActiveView);

  if (isDev) {
    window.loadURL("http://localhost:3000/tabs.html");
  } else {
    // TODO: What if I need to load the tabs.html file
    window.loadURL("app://-/tabs.html");
  }

  window.maximize();
  window.show();

  setTab(await createWindow());
}

const createWindow = async (href?: string) => {
  const view = new WebContentsView({
    webPreferences: {
      devTools: isDev,
      // enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: __dirname + "/client-preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  const name = uniqueId('Tab ');
  const instance: IWindowInstance = {
    view,
    serverProcess: null,
    workerReady: false,
    workerExited: false,
    connectRequested: false,
    name,
  };
  listWindow.push(instance);
  startWorker(instance);

  // and load the index.html of the app.

  // if (href) {
  //   // New tab with same location
  //   view.webContents.loadURL(href);
  // } else {
  //   if (isDev) {
  //     view.webContents.loadURL("http://localhost:3000");
  //   } else {
  //     view.webContents.loadURL("app://-");
  //   }
  // }

  if (isDev) {
    view.webContents.loadURL("http://localhost:3000");
  } else {
    view.webContents.loadURL("app://-");
  }

  if (isDev) {
    view.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.webContents.send('tabChange', getTabData());
  return instance;
};

const tabBarHeight = 36;

const layoutActiveView = () => {
  if (!mainWindow || !activeInstance) {
    return;
  }
  const { width, height } = mainWindow.getContentBounds();
  activeInstance.view.setBounds({ x: 0, y: tabBarHeight, width, height: height - tabBarHeight });
}

const setTab = (instance: IWindowInstance) => {
  ContextMenu.clearMainBindings(ipcMain);
  ContextMenu.mainBindings(ipcMain, instance.view, mainWindow, Menu, isDev, contextConfig);

  if (activeInstance && activeInstance !== instance) {
    mainWindow.contentView.removeChildView(activeInstance.view);
  }
  activeInstance = instance;
  mainWindow.contentView.addChildView(instance.view);
  layoutActiveView();
  mainWindow.webContents.send('tabChange', getTabData());
}

const releaseInstance = (instance: IWindowInstance) => {
  instance.serverProcess?.kill();
  instance.view.webContents.close();
}

interface TabList {
  tabs: string[];
  active: string;
}

const getTabData = (): TabList => {
  return {
    tabs: listWindow.map((instance) => instance.name),
    active: activeInstance?.name || ''
  }
}

// TODO: Also restart background process when user reload the app
function startWorker(instance: IWindowInstance) {
  const serverProcess = createBackgroundProcess(instance.name);
  instance.serverProcess = serverProcess;
  instance.workerReady = false;
  instance.workerExited = false;

  serverProcess.on("message", (msg: any) => {
    if (msg?.type === "ready") {
      instance.workerReady = true;
      connectWorker(instance);
    }
  });
  serverProcess.on("exit", (code) => {
    if (instance.serverProcess !== serverProcess || !listWindow.includes(instance)) {
      return;
    }
    log.error(`Worker of ${instance.name} exited with code ${code}`);
    instance.workerReady = false;
    instance.workerExited = true;
  });
}

function createBackgroundProcess(name: string) {
  const serverProcess = utilityProcess.fork(__dirname + "/workers/server.js", [
    "--subprocess",
    app.getVersion(),
    name,
    isDev ? "dev" : "prod",
  ], {
    cwd: app.getPath('userData'),
    serviceName: name,
    stdio: isDev ? "pipe" : "ignore",
  });

  serverProcess.once("spawn", () => log.info(`Done create background process #${serverProcess.pid}`));

  if (isDev) {
    serverProcess.stdout?.on("data", function (data: any) {
      log.info(data.toString());
    });
    serverProcess.stderr?.on("data", function (data: any) {
      log.error(data.toString());
    });
  }

  return serverProcess;
}

function connectWorker(instance: IWindowInstance) {
  if (!instance.workerReady || !instance.connectRequested) {
    return;
  }
  instance.connectRequested = false;

  const { port1, port2 } = new MessageChannelMain();
  instance.serverProcess?.postMessage({ type: "port" }, [port1]);
  instance.view.webContents.postMessage("worker-port", null, [port2]);
}

ipcMain.on("connect-worker", (event) => {
  const instance = listWindow.find(item => item.view.webContents.id === event.sender.id);
  if (!instance) {
    return;
  }

  if (instance.workerExited) {
    startWorker(instance);
  }
  instance.connectRequested = true;
  connectWorker(instance);
});

function bootstrap() {
  // Init key store
  const keyFolder = path.join(app.getPath('userData'), 'Keys');
  fs.mkdirSync(keyFolder, { recursive: true });

  // Init db
  db(app.getPath('userData'));
}

const newTab = async () => {
  const instance = await createWindow(activeInstance?.view.webContents.getURL());
  setTab(instance);
}
ipcMain.handle('open-url', async (event, url: string) => {
  if (canOpenExternally(url)) {
    await shell.openExternal(url);
  }
});

ipcMain.handle('new-tab', async (event, href: string) => {
  // Create new tab
  await newTab();
});

ipcMain.handle('get-tabs', async (event, href: string) => {
  return getTabData();
});

ipcMain.handle('rename-tab', async (event, newName: string) => {
  // return getTabData();
  if (activeInstance) {
    activeInstance.name = newName;
    mainWindow.webContents.send('tabChange', getTabData());
  }
});

ipcMain.handle('set-tab', async (event, tabName: string) => {
  setTab(listWindow.find(instance => instance.name === tabName) || listWindow[0])
});

const closeTab = (tabName: string) => {
  log.verbose(`Try to close tab ${tabName}`);
  const closeInstance = listWindow.find(instance => instance.name === tabName);
  if (closeInstance) {
    const currentState = getTabData();
    const closeIndex = listWindow.findIndex(instance => instance === closeInstance);

    if (closeInstance === activeInstance) {
      mainWindow.contentView.removeChildView(closeInstance.view);
      activeInstance = null;
    }
    releaseInstance(closeInstance);
    listWindow = listWindow.filter(instance => instance.name !== tabName); // Update the list
    if (listWindow.length === 0) {
      mainWindow.close();
      mainWindow = null;
      return;
    }
    if (closeInstance.name === currentState.active) {
      // If close the active one, try to set new active to the previous tab
      log.verbose(`Try to set new active tab`);
      setTab(listWindow[closeIndex <= 0 ? 0 : closeIndex - 1]);
      return;
    }

    mainWindow.webContents.send('tabChange', getTabData());
    return;
  }
}

ipcMain.handle('close-tab', async (event, tabName: string) => {
  closeTab(tabName);
})

ipcMain.handle('close-window', async (event, tabName: string) => {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }
});

ipcMain.handle('minimum-window', async (event, tabName: string) => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('toggle-maximum-window', async (event, tabName: string) => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return;
    }
    mainWindow.maximize();
    return;
  }
});

app.on('new-window-for-tab', () => {
  if (listWindow[0]?.view) {
    createWindow(listWindow[0]?.view.webContents.getURL());
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  bootstrap();
  createMainWindow();

  if (isDev) {
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name: string) => log.info(`Added Extension:  ${name}`))
      .catch((err: any) => log.info('An error occurred: ', err));
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (e, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (canOpenExternally(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  contents.on('will-navigate', (e, url) => {
    if (url !== contents.getURL()) {
      e.preventDefault();
      if (canOpenExternally(url)) shell.openExternal(url);
    }
  });
});

app.on("before-quit", () => {
  log.info("Before quit");
  listWindow.forEach(instance => {
    instance.serverProcess?.kill();
  })
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!mainWindow) {
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const template = [
  ...(isMacOS ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: "New Tab",
        accelerator: isMacOS ? 'Cmd+T' : 'Ctrl+T',
        click: async () => {
          await newTab()
        }
      },
      {
        label: "Close Tab",
        accelerator: isMacOS ? 'Cmd+W' : 'Ctrl+W',
        click: async () => {
          closeTab(getTabData().active);
        }
      },
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMacOS ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CommandOrControl+R',
        click: () => {
          activeInstance?.view.webContents.reload();
        }
      },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMacOS ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://refiapp.io')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template as any)
Menu.setApplicationMenu(menu)
