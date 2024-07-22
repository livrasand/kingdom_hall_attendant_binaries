const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const axios = require("axios");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

Menu.setApplicationMenu(false);

let mainWindow;
let wasConnected = false; 

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit(); 
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', () => {
    createWindow();

    setInterval(() => {
      checkInternetConnection().then((isConnected) => {
        if (isConnected !== wasConnected) { 
          wasConnected = isConnected;
          if (isConnected) {
            mainWindow.loadURL("https://www.getkha.org/login-desktop-client");
          } else {
            mainWindow.loadFile(path.join(__dirname, "offline.html"));
          }
        }
      });
    }, 1000);
  });

  app.on('window-all-closed', function () {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on('activate', function () {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(
      __dirname,
      "build",
      process.platform === "win32"
        ? "kha-icon.ico"
        : process.platform === "darwin"
        ? "kha-icon.icns"
        : "kha-icon.png"
    ),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.maximize();
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  checkInternetConnection().then((isConnected) => {
    wasConnected = isConnected;
    if (isConnected) {
      mainWindow.loadURL("https://www.getkha.org/login-desktop-client");
    } else {
      mainWindow.loadFile(path.join(__dirname, "offline.html"));
    }
  });

  if (process.platform === "darwin") {
    app.name = "Kingdom Hall Attendant";
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  autoUpdater.checkForUpdatesAndNotify();
}

function checkInternetConnection() {
  return axios.get('https://www.google.com')
    .then(() => true)
    .catch(() => false);
}

autoUpdater.on('update-available', (info) => {
  log.info('Update available.');
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded; will install now');
  autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (error) => {
  log.error('Error in auto-updater: ', error);
});
