/**
* @file Contains the main.js code of logre
* @author yafp
* @namespace main
*/

// -----------------------------------------------------------------------------
// REQUIRE: 3rd PARTY
// -----------------------------------------------------------------------------
const { app, BrowserWindow, electron, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const shell = require('electron').shell
const openAboutWindow = require('about-window').default // for: about-window

// ----------------------------------------------------------------------------
// REQUIRE: LOGRE MODULES
// ----------------------------------------------------------------------------
const { urlGitHubGeneral, urlGitHubIssues, urlGitHubChangelog, urlGitHubReleases } = require('./app/js/modules/githubUrls.js') // project-urls
const crash = require('./app/js/modules/crashReporter.js') // crashReporter
const sentry = require('./app/js/modules/sentry.js') // sentry
const unhandled = require('./app/js/modules/unhandled.js') // electron-unhandled

// ----------------------------------------------------------------------------
// VARIABLES & CONSTANTS
// ----------------------------------------------------------------------------

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// var path = require('path') // needed for icon-handling
var iconPath = path.join(__dirname, '/app/img/icon/icon.png')

const defaultUserDataPath = app.getPath('userData') // for: storing window position and size

// mainWindow: minimal window size
const mainWindowMinimalWindowHeight = 800
const mainWindowMinimalWindowWidth = 900

// ----------------------------------------------------------------------------
// FUNCTIONS
// ----------------------------------------------------------------------------

/**
* @function doLog
* @summary Writes console output for the main process
* @description Writes console output for the main process
* @memberof main
* @param {string} type - The log type
* @param {string} message - The log message
*/
function doLog (type, message) {
    const prefix = '[   Main   ] '
    const log = require('electron-log')
    // electron-log can: error, warn, info, verbose, debug, silly
    switch (type) {
    case 'info':
        log.info(prefix + message)
        break

    case 'warn':
        log.warn(prefix + message)
        break

    case 'error':
        log.error(prefix + message)
        break

    default:
        log.silly(prefix + message)
            // code block
    }
}

/**
* @function createWindowMain
* @summary Creates the mainWindow
* @description Creates the mainWindow (restores window position and size of possible)
* @memberof main
*/
function createWindow () {
    // Check last window position and size from user data
    var windowWidth
    var windowHeight
    var windowPositionX
    var windowPositionY

    // Read a local config file
    var customUserDataPath = path.join(defaultUserDataPath, 'LogreWindowPosSize.json')
    var data
    try {
        data = JSON.parse(fs.readFileSync(customUserDataPath, 'utf8'))

        // size
        windowWidth = data.bounds.width
        windowHeight = data.bounds.height

        // position
        windowPositionX = data.bounds.x
        windowPositionY = data.bounds.y

        doLog('info', 'createWindowMain ::: Got last window position and size information from _' + customUserDataPath + '_.')
    } catch (e) {
        doLog('warn', 'createWindowMain ::: No last window position and size information found in _' + customUserDataPath + '_. Using fallback values')

        // set some default values for window size
        windowWidth = mainWindowMinimalWindowWidth
        windowHeight = mainWindowMinimalWindowHeight
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        frame: false, // false results in a borderless window. Needed for custom titlebar
        titleBarStyle: 'hidden', // needed for custom-electron-titlebar. See: https://electronjs.org/docs/api/frameless-window
        width: windowWidth,
        minWidth: mainWindowMinimalWindowWidth,
        height: windowHeight,
        minHeight: mainWindowMinimalWindowHeight,
        resizable: true, // false = not resizeable
        show: false, // show when ready-to-show
        icon: iconPath,

        webPreferences:
        {
            nodeIntegration: true
        }
    })

    // Restore window position if possible
    //
    // requirements: found values in MediaDupesWindowPosSize.json from the previous session
    if ((typeof windowPositionX !== 'undefined') && (typeof windowPositionY !== 'undefined')) {
        mainWindow.setPosition(windowPositionX, windowPositionY)
    }

    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html')

    // configure menu
    mainWindow.setMenu(null) // works for builds, not while developing

    mainWindow.on('ready-to-show', function () {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('checkThingsOnceAtStart')
    })

    // Emitted before the window is closed.
    mainWindow.on('close', function (event) {
        doLog('info', 'createWindowMain ::: mainWindow will close (event: close)')

        // get window position and size
        var data = {
            bounds: mainWindow.getBounds()
        }

        // define target path (in user data)
        var customUserDataPath = path.join(defaultUserDataPath, 'LogreWindowPosSize.json')

        // try to write
        fs.writeFile(customUserDataPath, JSON.stringify(data), function (error) {
            if (error) {
                doLog('error', 'createWindowMain ::: storing window-position and -size of mainWindow in  _' + customUserDataPath + '_ failed with error: _' + error + '_ (event: close)')
                throw error
            }

            doLog('info', 'createWindowMain ::: mainWindow stored window-position and -size in _' + customUserDataPath + '_ (event: close)')
        })
    })

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        doLog('info', 'createWindowMain ::: mainWindow is closed (event: closed)')
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
    // forceSingleAppInstance() // check for single instance. We DONT want to force a singleInstance for this particular app.
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
