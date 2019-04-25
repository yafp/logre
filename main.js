// Modules to control application life and create native browser window
const {app, BrowserWindow} = require("electron");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


var path = require('path')
var iconPath = path.join(__dirname, '/app/img/icon/icon.png');


function createWindow ()
{
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    resizable: true, // false = not resizeable
    frame: true, // false = no title bar and borders
    //icon: __dirname + "build/icons",
    icon: iconPath,
    webPreferences:
    {
      nodeIntegration: true
    }
});

  // and load the index.html of the app.
  mainWindow.loadFile("app/index.html");


  // configure menu
  //
  mainWindow.setMenu(null); // works for builds, not while developing
  //mainWindow.setAutoHideMenuBar(true) // autohide seems to work

  // Open the DevTools. (manual trigger via: CTRL + SHIFT + I)
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function ()
  {
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
app.on("window-all-closed", function ()
{
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin")
  {
      app.quit();
  }
});

app.on("activate", function ()
{
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null)
  {
     createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// resizing the main window
const {ipcMain} = require("electron");
ipcMain.on("resize-me-please", (event, arg, arg2) =>
{
    // resize window
    //
    //mainWindow.setSize(width,height)
    mainWindow.setSize(arg, arg2);

    // center window
    //
    mainWindow.center();
});
