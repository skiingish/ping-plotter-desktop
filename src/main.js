const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
var ping = require('ping');

// Set env
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

// Should raw data be displayed (starts true, can be updated from a call from render.js)
let displayRawData = true;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'APP Name',
    width: isDev ? 1600 : 1400,
    height: 800,
    icon: `${__dirname}/assets/icons/icon.png`,
    resizable: true,
    show: isDev ? true : false,
    backgroundColor: '#232427',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // workaround to allow use with Electron 12+
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'app/index.html'));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Create the window
app.on('ready', () => {
  createWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
});

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Ping a host
let pinghost = async (host) => {
  let res = await ping.promise.probe(host);
  //console.log(res.time);
  return res;
};

//pinghost('192.168.1.1');

ipcMain.on('ping:pingonce', async (e, options) => {
  let result = await pinghost(options.host);

  const resultTime = result.time;
  //console.log(resultTime);
  mainWindow.webContents.send('ping:result', {
    resultTime,
  });
});
