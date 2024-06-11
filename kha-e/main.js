const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

Menu.setApplicationMenu(false)

let mainWindow;

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

  // Maximize the window
  mainWindow.maximize();
  // Remove the default menu
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false)

  mainWindow.loadFile("index.html");
  //mainWindow.loadURL("https://cadhub.pythonanywhere.com/");

  // On macOS, set the application name in the menu bar
  if (process.platform === "darwin") {
    app.name = "Kha";
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}


app.on("ready", () => {
  createWindow();

  //mainWindow.webContents.openDevTools();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
