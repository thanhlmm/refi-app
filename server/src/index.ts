import isDev from "electron-is-dev";
import log from 'electron-log';
if (isDev) {
  require('source-map-support').install();
}

if (!isDev) {
  log.transports.file.level = "verbose";
}

process.on('unhandledRejection', log.error);

import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import { fork } from "child_process";
import * as path from 'path';
import fs from 'fs';
import findOpenSocket from './utils/find-open-socket';
import db from './client/db';
import ContextMenu from './lib/electron-context-menu'
import { contextConfig } from './contextMenu';
import serve from 'electron-serve';
import { needConfirm, setConfirmReload, shouldConfirm } from "./lib/confirmReload";

const loadURL = serve({ directory: 'build' });

let serverProcess: any;
let serverSocket: string;
let mainWindow: BrowserWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: 1000,
    minWidth: 1500,
    minHeight: 900,
    backgroundColor: "#fff",
    icon: __dirname + '/assets/icon.icns',
    webPreferences: {
      // devTools: isDev,
      enableRemoteModule: false,
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/client-preload.js",
      disableDialogs: false,
      safeDialogs: true
    },
  });

  ContextMenu.mainBindings(ipcMain, mainWindow, Menu, isDev, contextConfig);

  mainWindow.maximize();
  mainWindow.show();

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    await loadURL(mainWindow);
  }

  mainWindow.webContents.on("did-finish-load", () => {
    if (serverSocket) {
      mainWindow.webContents.send("set-socket", {
        name: serverSocket,
      });
    }
  });

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
  }
};

// TODO: Also restart background process when user reload the app
async function createBackgroundProcess() {
  serverSocket = serverSocket || (await findOpenSocket());
  log.info(`Create background process for ${serverSocket}`);
  if (serverProcess) {
    // Ignore if server already created
    return;
  }
  serverProcess = fork(__dirname + "/workers/server.js", [
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

  setTimeout(() => {
    log.info('Notified client that the background process is live');
    mainWindow.webContents.send("set-socket", {
      name: serverSocket,
    });
  }, 500);

  serverProcess.on("message", (msg: any) => {
    log.info(msg);
  });
}

function bootstrap() {
  // Init key store
  const keyFolder = path.join(app.getPath('userData'), 'Keys');
  fs.mkdirSync(keyFolder, { recursive: true });

  // Init db
  db(app.getPath('userData'));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  bootstrap();
  createWindow();
  createBackgroundProcess();

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

  ContextMenu.clearMainBindings(ipcMain);

  if (serverProcess) {
    log.info("kill server");
    serverProcess.kill();
    serverProcess = null;
    serverSocket = null;
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
  if (serverProcess) {
    log.info("kill server");
    serverProcess.kill();
    serverProcess = null;
  }
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    createBackgroundProcess();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.