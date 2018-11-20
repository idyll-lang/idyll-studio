// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, Menu, ipcMain } = require("electron");
const fs = require("fs");
// var Idyll = require("idyll");

const path = require("path");
const url = require("url");

const startUrl =
  process.env.ELECTRON_START_URL ||
  url.format({
    pathname: path.join(__dirname, "/../build/index.html"),
    protocol: "file:",
    slashes: true
  });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(startUrl);

  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          accelerator: "CmdOrCtrl+O",
          click() {
            openFile();
          }
        }
      ]
    },
    {
      label: "Developer",
      submenu: [
        {
          label: "Toggle Developer Tools",
          accelerator: process.platform === "darwin" ? "Cmd+I" : "Ctrl+I",
          click() {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu); // use menu we just created

  // mainWindow.webContents.on("did-finish-load", () => {
  //   mainWindow.webContents.send("ping", "HIII");
  // });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Open File
function openFile() {
  // Returns absolute path of file
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      {
        // Give a specific filter on what
        // type of files we are looking for
        name: "Idyll",
        extensions: ["idyll", "idl"]
      }
    ]
  });

  // If no files
  if (!files) {
    return;
  }

  // Gets full file path
  const file = files[0];

  // Accepts a file path
  const fileContent = fs.readFileSync(file).toString();

  console.log(fileContent);

  mainWindow.webContents.send("ping", "testing");
}
