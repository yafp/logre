// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const shell = require('electron').shell

const openAboutWindow = require('about-window').default // for: about-window

const { urlGitHubGeneral, urlGitHubIssues, urlGitHubChangelog, urlGitHubReleases } = require('./app/js/modules/githubUrls.js') // project-urls

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

var path = require('path') // needed for icon-handling

var iconPath = path.join(__dirname, '/app/img/icon/icon.png')

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 1000,
        resizable: true, // false = not resizeable
        frame: true, // false = no title bar and borders
        // icon: __dirname + "build/icons",
        icon: iconPath,
        webPreferences:
        {
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html')

    // configure menu
    //
    mainWindow.setMenu(null) // works for builds, not while developing
    // mainWindow.setAutoHideMenuBar(true) // autohide seems to work

    // Open the DevTools. (manual trigger via: CTRL + SHIFT + I)
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null
    })
}

/**
* @function createMenuMain
* @summary Creates the application menu
* @description Creates the application menu
* @memberof main
*/
function createMenuMain () {
    // doLog('createMenu', __dirname)

    // Create a custom menu
    var menu = Menu.buildFromTemplate([

        // Menu: File
        {
            label: 'File',
            submenu: [
                // Settings
                {
                    label: 'Settings',
                    // icon: __dirname + '/app/img/icon/icon.png',
                    click () {
                        mainWindow.webContents.send('openSettings')
                    },
                    enabled: false,
                    accelerator: 'CmdOrCtrl+,'
                },
                {
                    type: 'separator'
                },
                // Exit
                {
                    role: 'quit',
                    label: 'Exit',
                    click () {
                        app.quit()
                    },
                    accelerator: 'CmdOrCtrl+Q'
                }
            ]
        },

        // Menu: Edit
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    selector: 'undo:'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    selector: 'redo:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    selector: 'paste:'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    selector: 'selectAll:'
                }
            ]
        },

        // Menu: View
        {
            label: 'View',
            submenu: [
                {
                    role: 'reload',
                    label: 'Reload',
                    click (item, mainWindow) {
                        mainWindow.reload()
                    },
                    accelerator: 'CmdOrCtrl+R'
                }
            ]
        },

        // Menu: Window
        {
            label: 'Window',
            submenu: [
                {
                    role: 'togglefullscreen',
                    label: 'Toggle Fullscreen',
                    click (item, mainWindow) {
                        if (mainWindow.isFullScreen()) {
                            mainWindow.setFullScreen(false)
                        } else {
                            mainWindow.setFullScreen(true)
                        }
                    },
                    accelerator: 'F11' // is most likely predefined on osx - results in: doesnt work on osx
                },
                {
                    role: 'minimize',
                    label: 'Minimize',
                    click (item, mainWindow) {
                        if (mainWindow.isMinimized()) {
                            // mainWindow.restore();
                        } else {
                            mainWindow.minimize()
                        }
                    },
                    accelerator: 'CmdOrCtrl+M'
                },
                {
                    label: 'Maximize',
                    click (item, mainWindow) {
                        if (mainWindow.isMaximized()) {
                            mainWindow.unmaximize()
                        } else {
                            mainWindow.maximize()
                        }
                    },
                    accelerator: 'CmdOrCtrl+K'
                }
            ]
        },

        // Menu: Help
        {
            role: 'help',
            label: 'Help',
            submenu: [
                // About
                {
                    role: 'about',
                    label: 'About',
                    click () {
                        openAboutWindow({
                            icon_path: path.join(__dirname, 'app/img/about/icon_about.png'),
                            open_devtools: false,
                            use_version_info: true,
                            win_options: // https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions
                    {
                        autoHideMenuBar: true,
                        titleBarStyle: 'hidden',
                        minimizable: false, // not implemented on linux
                        maximizable: false, // not implemented on linux
                        movable: false, // not implemented on linux
                        resizable: false,
                        alwaysOnTop: true,
                        fullscreenable: false,
                        skipTaskbar: false
                    }
                        })
                    }
                },
                // open homepage
                {
                    label: 'Homepage',
                    click () {
                        shell.openExternal(urlGitHubGeneral)
                    },
                    accelerator: 'F1'
                },
                // report issue
                {
                    label: 'Report issue',
                    click () {
                        shell.openExternal(urlGitHubIssues)
                    },
                    accelerator: 'F2'
                },
                // open changelog
                {
                    label: 'Changelog',
                    click () {
                        shell.openExternal(urlGitHubChangelog)
                    },
                    accelerator: 'F3'
                },
                // open Releases
                {
                    label: 'Releases',
                    click () {
                        shell.openExternal(urlGitHubReleases)
                    },
                    accelerator: 'F4'
                },
                {
                    type: 'separator'
                },
                // Update
                {
                    label: 'Search logre updates',
                    click (item, mainWindow) {
                        mainWindow.webContents.send('startSearchUpdatesVerbose')
                    },
                    enabled: false,
                    accelerator: 'F9'
                },
                {
                    type: 'separator'
                },

                // Console
                {
                    id: 'HelpConsole',
                    label: 'Console',
                    click (item, mainWindow) {
                        mainWindow.webContents.toggleDevTools()
                    },
                    enabled: true,
                    accelerator: 'F12'
                }
            ]
        }
    ])

    // use the menu
    Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', function () {
    // forceSingleAppInstance() // check for single instance
    createWindow() // create the application UI
    createMenuMain() // create the application menu
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// resizing the main window
const { ipcMain } = require('electron')
ipcMain.on('resize-me-please', (event, arg, arg2) => {
    // resize window
    // mainWindow.setSize(width,height)
    mainWindow.setSize(arg, arg2)

    // center window
    mainWindow.center()
})
