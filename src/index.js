

const { app, BrowserWindow, nativeTheme } = require('electron');
const path = require('path');
const url = require('url');
const Main = require('./main/main.js');
const DataStore = require('./main/data-store/data-store');
const isDev = require('electron-is-dev');

if (!isDev && process.platform !== "win32") {
  if (process.platform === 'darwin') {
    const fixPath = require('fix-path');
    fixPath();
  } else {
    const shellPath = require('shell-path');
    process.env.PATH = shellPath.sync() || [
      path.join(__dirname, '..', '/node_modules/npm/bin'),
      '/.nodebrew/current/bin',
      '/usr/local/bin',
      process.env.PATH
    ].join(':');
  }
}

// add local node_modules
let pathSeparator = process.platform === "win32" ? ';' : ':';
process.env.PATH = process.env.PATH.split(pathSeparator).concat([path.resolve(`${__dirname}/../node_modules/.bin`), path.resolve(`${__dirname}/../node_modules/npm/bin`)]).join(pathSeparator);


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    width: 1300,
    height: 1000,
    minWidth: 600,
    minHeight: 400,
    title: 'Idyll Studio',
    show: false
  });

  const store = new DataStore();

  const main = new Main({ app, win, store });

  // When everything is ready to load, show window
  win.once('ready-to-show', () => {
    const existingProjectPath = store.getLastSessionProjectPath();
    if (existingProjectPath) {
      main.executeOnProjectOpen(existingProjectPath);
    }
    win.show();
  });

  // load the index.html of the app based on script ENV Variables.
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      })
    );

    // Open the DevTools only in Development mode.
    win.webContents.openDevTools();
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if(require('electron-squirrel-startup')) return;
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
