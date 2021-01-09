const path = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const { fork } = require("child_process");
const findOpenSocket = require("./utils/find-open-socket");

let serverProcess;
let serverSocket;

process.env.ELECTRON_IS_DEV = isDev;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
} // NEW!

function createWindow(socketName) {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    backgroundColor: "#fff",
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + "/client-preload.js",
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    true
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "./build/index.html")}` // TODO: Map to right path
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("set-socket", {
      name: socketName,
    });
  });
}

// TODO: Also restart background process when user reload the app
function createBackgroundProcess(socketName) {
  console.log("Create background process");
  if (serverProcess) {
    // Ignore if server already created
    return;
  }
  serverProcess = fork(__dirname + "/workers/server.js", [
    "--subprocess",
    app.getVersion(),
    socketName,
  ]);

  if (isDev) {
    // Print console.log of child process
    serverProcess.stdout.on("data", function (data) {
      console.log(data.toString());
    });
  }

  serverProcess.on("message", (msg) => {
    console.log(msg);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  serverSocket = serverSocket || (await findOpenSocket());
  createWindow(serverSocket);

  createBackgroundProcess(serverSocket);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }

  if (isDev && serverProcess) {
    console.log("kill server");
    serverProcess.kill();
    serverProcess = null;
  }
});

app.on("before-quit", () => {
  console.log("Before quit");
  if (serverProcess) {
    console.log("kill server");
    serverProcess.kill();
    serverProcess = null;
  }
});

app.on("activate", async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    serverSocket = serverSocket || (await findOpenSocket());
    createWindow(serverSocket);

    if (isDev) {
      createBackgroundProcess(serverSocket);
    }
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
