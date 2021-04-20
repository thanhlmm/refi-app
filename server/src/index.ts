import isDev from "electron-is-dev";
import log from 'electron-log';
if (isDev) {
  require('source-map-support').install();
}

if (!isDev) {
  log.transports.file.level = "verbose";
}

process.on('unhandledRejection', log.error);

import { app, BrowserWindow, ipcMain, Menu, autoUpdater, dialog, BrowserView, globalShortcut, MenuItem } from 'electron';
import { fork, ChildProcess } from "child_process";
import * as path from 'path';
import fs from 'fs';
import findOpenSocket from './utils/find-open-socket';
import db from './client/db';
import ContextMenu from './lib/electron-context-menu'
import { contextConfig } from './contextMenu';
import serve from 'electron-serve';
import { uniqueId } from "lodash";
// import { needConfirm, setConfirmReload, shouldConfirm } from "./lib/confirmReload";

const loadURL = serve({ directory: 'build' });
app.disableHardwareAcceleration()

interface IWindowInstance {
  window: BrowserView;
  serverSocket: string;
  serverProcess: ChildProcess;
  name: string;
}

let listWindow: IWindowInstance[] = [];

let mainWindow: BrowserWindow;

const isMacOS = process.platform === 'darwin';
// const isMacOS = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

if (!isDev) {
  const server = "https://refi-updater.vercel.app";
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`

  autoUpdater.setFeedURL({ url: feed, serverType: "json" })

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60000);

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    log.debug('Downloaded new update');
    const dialogOpts = {
      type: 'info',
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
    minWidth: 1500,
    minHeight: 900,
    backgroundColor: isMacOS ? "#D1D5DB" : "#6B7280",
    icon: path.join(__dirname, '../assets/icon.icns'),
    titleBarStyle: isMacOS ? 'hiddenInset' : 'default',
    frame: isMacOS,
    webPreferences: {
      devTools: isDev,
      enableRemoteModule: false,
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/tab-preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  mainWindow = window;

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  ContextMenu.mainBindings(ipcMain, window, Menu, isDev, contextConfig);
  if (isDev) {
    window.loadURL("http://localhost:3000/tabs.html");
  } else {
    // TODO: What if I need to load the tabs.html file
    window.loadURL("app://-/tabs.html");
  }

  window.maximize();
  window.show();

  const windowView = await createWindow();
  setTab(windowView);
  // TODO: Handle reload event
}

const createWindow = async (href?: string) => {
  // Create the browser window.
  const window = new BrowserView({
    webPreferences: {
      devTools: isDev,
      enableRemoteModule: false,
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/client-preload.js",
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false,
    },
  });

  // Create sever process
  const { serverSocket, serverProcess } = await createBackgroundProcess(window);

  ContextMenu.mainBindings(ipcMain, window, Menu, isDev, contextConfig);
  // and load the index.html of the app.
  if (href) {
    // New tab with same location
    window.webContents.loadURL(href);
  } else {
    if (isDev) {
      window.webContents.loadURL("http://localhost:3000");
    } else {
      window.webContents.loadURL("app://-");
    }
  }

  window.webContents.on("did-finish-load", () => {
    if (serverSocket) {
      window.webContents.send("set-socket", {
        name: serverSocket,
      });
    }
  });

  // TODO: How to kill the process
  // window.on('close', () => {
  //   log.info(`${window.id} closed`);
  //   log.info("kill server");
  //   serverProcess.kill();
  //   ContextMenu.clearMainBindings(ipcMain);
  //   listWindow = listWindow.filter(instance => instance.window.id !== window.id);
  // })

  // // Open the DevTools.
  // if (isDev) {
  //   window.webContents.openDevTools({ mode: 'bottom' });
  // }

  // if (listWindow.length <= 0) {
  //   log.verbose('Create new window');
  //   window.maximize();
  //   window.show();
  // } else {
  //   log.verbose('Append window to tab');
  //   listWindow[0].window.addTabbedWindow(window);
  //   listWindow[0].window.selectNextTab();
  // }

  listWindow.push({
    window,
    serverSocket,
    serverProcess,
    name: uniqueId('Tab ')
  });


  mainWindow.webContents.send('tabChange', getTabData());
  return window;
};

const setTab = (instance: BrowserView) => {
  mainWindow.setBrowserView(instance);
  instance.setAutoResize({ width: true, height: true, horizontal: true, vertical: true });
  instance.setBounds({ x: 0, y: 36, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
  mainWindow.webContents.send('tabChange', getTabData());
}

interface TabList {
  tabs: string[];
  active: string;
}

const getTabData = (): TabList => {
  return {
    tabs: listWindow.map((instance) => instance.name),
    active: listWindow.find((instance) => instance.window.webContents.id === mainWindow.getBrowserView()?.webContents?.id)?.name || ''
  }
}

// TODO: Also restart background process when user reload the app
async function createBackgroundProcess(window?: BrowserWindow | BrowserView) {
  const serverSocket = await findOpenSocket();
  log.info(`Create background process for ${serverSocket}`);
  const serverProcess = fork(__dirname + "/workers/server.js", [
    "--subprocess",
    app.getVersion(),
    serverSocket,
  ], {
    cwd: app.getPath('userData')
  });

  log.info(`Done create background process #${serverProcess.pid}`);

  if (isDev) {
    // Print log.info of child process
    serverProcess?.stdout?.on("data", function (data: any) {
      log.info(data.toString());
    });
  }

  if (window) {
    setTimeout(() => {
      log.info('Notified client that the background process is live');
      window.webContents.send("set-socket", {
        name: serverSocket,
      });
    }, 300);
  }

  serverProcess.on("message", (msg: any) => {
    log.info(msg);
  });

  return { serverProcess, serverSocket };
}

function bootstrap() {
  // Init key store
  const keyFolder = path.join(app.getPath('userData'), 'Keys');
  fs.mkdirSync(keyFolder, { recursive: true });

  // Init db
  db(app.getPath('userData'));
}

const newTab = async () => {
  const window = await createWindow(mainWindow.getBrowserView()?.webContents.getURL());
  setTab(window);
}
ipcMain.handle('new-tab', async (event, href: string) => {
  // Create new tab
  await newTab();
});

ipcMain.handle('get-tabs', async (event, href: string) => {
  return getTabData();
});

ipcMain.handle('set-tab', async (event, tabName: string) => {
  setTab(listWindow.find(instance => instance.name === tabName).window || listWindow[0].window)
});

const closeTab = (tabName: string) => {
  log.verbose(`Try to close tab ${tabName}`);
  const closeInstance = listWindow.find(instance => instance.name === tabName);
  if (closeInstance) {
    const currentState = getTabData();
    const closeIndex = listWindow.findIndex(instance => instance === closeInstance);

    closeInstance.serverProcess.kill(); // Kill the server
    listWindow = listWindow.filter(instance => instance.name !== tabName); // Update the list
    if (listWindow.length === 0) {
      mainWindow.close();
      mainWindow = null;
      return;
    }
    if (closeInstance.name === currentState.active) {
      // If close the active one, try to set new active to the previous tab
      log.verbose(`Try to set new active tab`);
      setTab(listWindow[closeIndex <= 0 ? 0 : closeIndex - 1].window);
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
  if (listWindow[0]?.window) {
    createWindow(listWindow[0]?.window.webContents.getURL());
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
  contents.on('new-window', (e, url) => {
    e.preventDefault();
    require('open')(url);
  });
  contents.on('will-navigate', (e, url) => {
    if (url !== contents.getURL()) e.preventDefault(), require('open')(url);
  });
});

app.on("before-quit", () => {
  log.info("Before quit");
  listWindow.forEach(instance => {
    instance.serverProcess.kill();
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

const menu = new Menu()
if (isMacOS) {
  menu.append(new MenuItem({
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }))
}
menu.append(new MenuItem({
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
}))

Menu.setApplicationMenu(menu)
