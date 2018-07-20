const electron = require('electron');
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem
const ipc = electron.ipcMain

const autoUpdater = electron.autoUpdater;
const dialog = electron.dialog;

const server = 'http://127.0.0.1:5000/';
const feed = `${server}/update/${process.platform}/${app.getVersion()}`;
console.log(feed);
autoUpdater.setFeedURL(feed);
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts, (response) => {
        if (response === 0) autoUpdater.quitAndInstall()
    })
});
autoUpdater.on('error', message => {
    console.error('There was a problem updating the application')
    console.error(message)
})
setInterval(() => {
    autoUpdater.checkForUpdates()
}, 60000);

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    let startUrl = process.env.ELECTRON_START_URL || false;
    console.log('startUrl',startUrl.length);
    if(startUrl.length < 6){
        startUrl = url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        });
    }
    console.log('startUrl',startUrl.toString());
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1366, height: 768});

    // and load the index.html of the app.
    mainWindow.loadURL(startUrl);

    
    // Open the DevTools.
    // if(process.env.NODE_ENV != 'production'){
    //     mainWindow.webContents.openDevTools();
    // }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

const menu = new Menu();
menu.append(new MenuItem({ label: 'Инструменты для разработчика', click: () => {
            mainWindow.webContents.openDevTools();
          } }));

app.on('browser-window-created', function (event, win) {
  win.webContents.on('context-menu', function (e, params) {
    menu.popup(win, params.x, params.y)
  })
})
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.