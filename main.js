// Modules to control application life and create native browser window
const {app, ipcMain} = require('electron');
const {BrowserWindow} = require("electron-acrylic-window");
const remote = require('@electron/remote/main');
remote.initialize();

let mainWindow;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 950,
    minWidth: 800,
    minHeight: 400,
    titleBarStyle: 'hidden', // Hide titleBar since we'll use our own custom controls
    webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
    },
    frame: true/* ,
    vibrancy: {
        theme: 'dark',
        effect: 'acrylic',
        useCustomWindowRefreshMethod: true,
        disableOnBlur: true,
        debug: false
    } */
  })

  // Load app frontend
  mainWindow.loadFile('index.html');

  // Open DevTools (debug)
  //mainWindow.webContents.openDevTools();

  // Enable remote module
  remote.enable(mainWindow.webContents);

  return mainWindow;

};

// When Electron finishes initialising, create the main app window and assign
// the BrowserWindow instance it returns to the app scoped mainWindow variable.
app.whenReady().then(() => mainWindow = createWindow());

// Quit when all windows are closed
app.on('window-all-closed', () => app.quit());