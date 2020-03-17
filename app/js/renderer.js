// ----------------------------------------------------------------------------
// IMPORT LOGRE MODULES
// ----------------------------------------------------------------------------
const utils = require('./js/modules/utils.js')

/**
* @name checkRequirements
* @summary Central launcher for several init scripts
* @description Gets executed on app launch and starts several other methods
* @memberof renderer
*/
function checkRequirements () {
    utils.writeConsoleMsg('info', 'checkRequirements ::: Starting ...')
    checkForSyslogExistance()
    journalCtlCheck()
    checkDisplaySize()
}

/**
* @name checkSupportedOperatingSystem
* @summary Checks if the operating system is supported or not
* @description Checks if the operating system is linux. If it isnt a modal error is displayed which results in closing the app after confirmation.
* @memberof renderer
*/
function checkSupportedOperatingSystem () {
    var userPlatform = process.platform
    utils.writeConsoleMsg('info', 'checkSupportedOperatingSystem ::: Detected operating system as: ' + userPlatform)

    if (userPlatform === 'linux') {
        utils.writeConsoleMsg('info', 'checkSupportedOperatingSystem ::: Operating system ' + userPlatform + ' is fine.')
    } else {
        utils.writeConsoleMsg('error', 'checkSupportedOperatingSystem ::: Operating system ' + userPlatform + ' is not supported.')
        utils.showNoty('error', 'Operating system ' + userPlatform + ' is not supported.', 0)
    }
}

/**
* @name checkForSyslogExistance
* @summary Checks if /var/log/syslog exists or ont
* @description Checks if /var/log/syslog exists. If not a modal error is displayed which results in closing the app after confirmation.
* @memberof renderer
*/
function checkForSyslogExistance () {
    var fs = require('fs')
    var logFile = '/var/log/syslog'

    if (fs.existsSync(logFile)) {
        utils.writeConsoleMsg('info', 'checkForSyslogExistance ::: Found syslog in:' + logFile)
        syslogStart()
        $('#homeSyslogStatus').html('enabled')
        $('#homeSyslogStatus').removeClass(' badge-danger').addClass('badge-success')
    } else {
        $('#navTabSyslog').hide()
        $('#homeSyslogStatus').html('disabled')
        $('#homeSyslogStatus').removeClass('badge-success').addClass('badge-danger')
        utils.writeConsoleMsg('warn', 'checkForSyslogExistance ::: Unable to find syslog in: ' + logFile + '. Tab is now hidden')
    }
}

/**
* @name journalCtlCheck
* @summary Checks if journalctl is supported on this system
* @description Checks if journalctl is supported on this system. Hides the tab if not. Updates the home tab
* @memberof renderer
*/
function journalCtlCheck () {
    var fs = require('fs')
    var which = require('which') // needed to locate journalctl binary
    var logFile

    // async usage
    which('journalctl', function (err, resolvedPath) {
        if (err) {
            utils.writeConsoleMsg('warn', 'journalCtlCheck ::: Unable to find journalctl. Tab is now hidden')
            utils.showNoty('warning', 'Unable to find journalctl')
            $('#navTabJournalCtl').hide()// disable the tab

            // update home tab
            $('#homeJournalCtlStatus').html('disabled')
            $('#homeJournalCtlStatus').removeClass('badge-success').addClass('badge-danger')
        } else {
            logFile = resolvedPath
            utils.writeConsoleMsg('info', 'journalCtlCheck ::: Found journalctl in:' + logFile)
            journalCtlStart()

            // update home tab
            $('#homeJournalCtlStatus').html('enabled')
            $('#homeJournalCtlStatus').removeClass(' badge-danger').addClass('badge-success')
        }
    })
}

/**
* @name journalCtlStart
* @summary Starts the monitoring for journalctl
* @description Starts the monitoring for journalctl
* @memberof renderer
*/
function journalCtlStart () {
    utils.writeConsoleMsg('info', 'journalCtlStart ::: Starting journalctl monitoring')

    const Journalctl = require('journalctl')
    // const journalctl = new Journalctl()
    const journalctl = new Journalctl('All')

    // in cli: journalctl -o short  = syslog like info columns only

    // init the datatable
    //
    //var t = $('#dtJournalCtl').DataTable()
    var table = $('#dtJournalCtl').DataTable({
            order: [[0, 'desc']], // order based on ID
            dom: 'Bfrtip',

            // Buttons
            buttons: [
                {
                    extend: 'print',
                    name: 'printButton',
                    text: 'Print'
                },
                {
                    extend: 'copy',
                    name: 'copyButton',
                    text: 'Clipboard'
                },
                {
                    extend: 'csv',
                    name: 'csvButton',
                    text: 'CSV'
                },
                {
                    extend: 'excel',
                    name: 'excelButton',
                    text: 'Excel'
                },
                {
                    extend: 'pdf',
                    name: 'pdfButton',
                    text: 'PDF'
                },
                {
                    extend: 'colvis',
                    name: 'colvisButton',
                    text: 'Columns'
                }
            ],

            // colreorder
            colReorder: true,

            // pagination
            pagingType: 'numbers',

            // Dropdown for columns
            //
            initComplete: function () {
                // Dropdown for all columns
                // this.api().columns().every( function () {

                // dropdown for some columns
                var columns = [2, 3] // Add columns here
                this.api().columns(columns).every(function () {
                    var column = this
                    var select = $('<select class="logreSelects"><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            )

                            column.search(val ? '^' + val + '$' : '', true, false).draw()
                        })

                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    })
                })
            }
            // End Dropdown for columns

        })



    journalctl.on('event', (event) => {
        // console.error(event)

        // https://www.freedesktop.org/software/systemd/man/systemd.journal-fields.html#


        // PID (Trusted journal field)
        //
        // The process, user, and group ID of the process the journal entry originates from formatted as a decimal string. 
        // Note that entries obtained via "stdout" or "stderr" of forked processes will contain credentials 
        // valid for a parent process (that initiated the connection to systemd-journald).
        var pid = ''
        if (typeof event._PID !== 'undefined') {
            pid = event._PID
        }

        // _SOURCE_REALTIME_TIMESTAMP (Trusted journal field)
        //
        // The earliest trusted timestamp of the message, if any is known that is different from the reception time of the journal. 
        // This is the time in microseconds since the epoch UTC, formatted as a decimal string.
        var realtimeTimestamp = ''
        if (typeof event._SOURCE_REALTIME_TIMESTAMP !== 'undefined') {
            realtimeTimestamp = event._SOURCE_REALTIME_TIMESTAMP

            // make it hiuman readable
            //realtimeTimestamp = calcHumanReadableTimeStamp(realtimeTimestamp)
        }

        // _MACHINE_ID (Trusted journal field)
        //
        // The machine ID of the originating host, as available in machine-id(5).
        var machineId = ''
        if (typeof event._MACHINE_ID !== 'undefined') {
            machineId = event._MACHINE_ID
        }

        // _HOSTNAME (Trusted journal field)
        //
        // The name of the originating host.
        var hostname = ''
        if (typeof event._HOSTNAME !== 'undefined') {
            hostname = event._HOSTNAME
        }








        // SYSLOG_TIMESTAMP
        var syslogTimestamp = ''
        if (typeof event.SYSLOG_TIMESTAMP !== 'undefined') {
            syslogTimestamp = event.SYSLOG_TIMESTAMP
        }

        // PRIORITY
        var priority = ''
        if (typeof event.PRIORITY !== 'undefined') {
            priority = event.PRIORITY
        }

        // SYSLOG_IDENTIFIER
        var syslogIdentifier = ''
        if (typeof event.SYSLOG_IDENTIFIER !== 'undefined') {
            syslogIdentifier = event.SYSLOG_IDENTIFIER
        }

        // UNIT
        var unit = ''
        if (typeof event.UNIT !== 'undefined') {
            unit = event.UNIT
        }

        // EXE (Trusted journal field)
        var exe = ''
        if (typeof event._EXE !== 'undefined') {
            exe = event._EXE
        }

        // MESSAGE
        //
        // The human-readable message string for this entry. This is supposed to be the primary text shown to the user. 
        // It is usually not translated (but might be in some cases), and is not supposed to be parsed for metadata.
        var message = ''
        if (typeof event.MESSAGE !== 'undefined') {
            message = event.MESSAGE
        }

        // MESSAGE_ID
        //
        // A 128-bit message identifier ID for recognizing certain message types, if this is desirable. 
        // This should contain a 128-bit ID formatted as a lower-case hexadecimal string, without any separating dashes or suchlike. 
        // This is recommended to be a UUID-compatible ID, but this is not enforced, and formatted differently. 
        // Developers can generate a new ID for this purpose with systemd-id128 new. 
        var messageId = ''
        if (typeof event.MESSAGE_ID !== 'undefined') {
            messageId = event.MESSAGE_ID
        }

        // Add record to table
        journalCtlAddRecord(
            pid, 
            realtimeTimestamp, 
            machineId,
            hostname,
            syslogTimestamp, 
            priority, 
            syslogIdentifier, 
            unit, 
            exe, 
            message, 
            messageId
            )
    })
}

/**
* @function journalCtlAddRecord
* @summary Adds a record to the journalctl dataTable
* @description Adds a record to the journalctl dataTable
* @memberof renderer
*/
function journalCtlAddRecord (pid, realtimeTimestamp, machineId, hostname, timestamp, priority, syslogIdentifier, unit, exe, message, messageId) {
    var t = $('#dtJournalCtl').DataTable()

    t.row.add([
        pid,
        realtimeTimestamp,
        machineId,
        hostname,
        timestamp,
        priority,
        syslogIdentifier,
        unit,
        exe,
        message,
        messageId
    ]).draw(false)
}

/**
* @function titlebarInit
* @summary Init the titlebar for the frameless mainWindow
* @description Creates a custom titlebar for the mainWindow using custom-electron-titlebar (https://github.com/AlexTorresSk/custom-electron-titlebar).
* @memberof renderer
*/
function titlebarInit () {
    const customTitlebar = require('custom-electron-titlebar')
    const myTitlebar = new customTitlebar.Titlebar({
        titleHorizontalAlignment: 'center', // position of window title
        icon: 'img/icon/icon.png',
        drag: true, // whether or not you can drag the window by holding the click on the title bar.
        backgroundColor: customTitlebar.Color.fromHex('#171717'),
        minimizable: true,
        maximizable: true,
        closeable: true,
        itemBackgroundColor: customTitlebar.Color.fromHex('#525252') // hover color
    })

    // Be aware: the font-size of .window-title (aka application name) is set by app/css/core.css
    utils.writeConsoleMsg('info', 'titlebarInit ::: Initialized custom titlebar')
}

/**
* @name syslogStart
* @summary Fetches data from syslog and builds the DataTable
* @description Reads entire syslog file, puts the data in arrays and loads the data into the DataTable
* @memberof renderer
*/
function syslogStart () {
    // init select2
    //$('#logSource').select2()

    // creating empty arrays
    var arrayLogDate = []
    var arrayLogSrc = []
    var arrayLogApp = []
    var arrayLogMsg = []

    // Read from file
    //
    // source: https://stackoverflow.com/questions/6831918/node-js-read-a-text-file-into-an-array-each-line-an-item-in-the-array

    // requirement to read from file
    var fs = require('fs')
    var syslogLocation = '/var/log/syslog'

    console.log('syslogStart ::: Trying to read from: ' + syslogLocation)

    // Synchronous
    /*
    var array = fs.readFileSync('file.txt').toString().split("\n");
    for(i in array) {
    console.log(array[i]);
}
*/

    // Asynchronous
    fs.readFile(syslogLocation, function (err, data) {
        if (err) {
            throw err
        }

        var array = data.toString().split('\n') // fill array with content of syslog-file

        // process file content line by line
        for (var i in array) {
            var curLine = array[i]

            // example
            // Apr 10 00:39:01 localhost CRON[1856]: (root) CMD (  [ -x /usr/lib/php/sessionclean ] && if [ ! -d /run/systemd/system ]; then /usr/lib/php/sessionclean; fi)

            var targetPosFirstSplit = nthChar(curLine, ' ', 3)
            var targetPosSecondSplit = nthChar(curLine, ' ', 4)
            var targetPosThirdSplit = nthChar(curLine, ' ', 5)

            // split line into several arrays
            var logDate = curLine.substr(0, targetPosFirstSplit)
            var logSrc = curLine.substr(targetPosFirstSplit + 1, (targetPosSecondSplit - targetPosFirstSplit - 1))
            var logApp = curLine.substr(targetPosSecondSplit + 1, targetPosThirdSplit - targetPosSecondSplit)
            // clean logApp
            // default value looks like that: cron[PID]:
            // target looks like: cron
            var targetPosPIDSplit = nthChar(logApp, '[', 1)
            logApp = logApp.substr(0, targetPosPIDSplit)

            var logMsg = curLine.substr(targetPosThirdSplit + 1)

            // add values to specific array
            arrayLogDate.push(logDate)
            arrayLogSrc.push(logSrc)
            arrayLogApp.push(logApp)
            arrayLogMsg.push(logMsg)

            // logging
            //
            // console.log(logDate);
            // console.log(logSrc);
            // console.log('_'+logSrc+'_');
            // console.log(logMsg);
            // console.log("--");
            // console.error(arrayLogDate.length);
        }

        console.log('syslogStart ::: finished reading source file. Amount of rows: ' + arrayLogDate.length)

        // Creating DataSet
        //
        console.log('syslogStart ::: Generating dataset for DataTable')
        var dataSet2 = []
        var arrayLength = arrayLogDate.length
        for (i = 0; i < arrayLength - 1; i++) {
            dataSet2.push({ id: i, date: arrayLogDate[i], source: arrayLogSrc[i], app: arrayLogApp[i], msg: arrayLogMsg[i] })
        }
        console.log('syslogStart ::: Finished generating dataset for DataTable')

        // init datatable
        //
        // $('#example').DataTable();
        var table = $('#example').DataTable({
            order: [[0, 'desc']], // order based on ID
            data: dataSet2,
            columns: [
                { data: 'id' },
                { data: 'date' },
                { data: 'source' },
                { data: 'app' },
                { data: 'msg' }
            ],

            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'colvis'
            ],

            // pagination
            pagingType: 'numbers',

            // colorize the different event-types
            //
            rowCallback: function (row, data) {
                // check col: source
                if (data.source === 'localhost') {
                    $('td:eq(2)', row).addClass('m_greenLight')
                }

                // check col: msg -> in red
                if ((data.msg.toLowerCase().includes('error')) || (data.msg.toLowerCase().includes('fail'))) {
                    $('td:eq(4)', row).addClass('m_redLight')
                }
                // check col: msg -> in orange
                if (data.msg.toLowerCase().includes('warning') || (data.msg.toLowerCase().includes('unable'))) {
                    $('td:eq(4)', row).addClass('m_orangeLight')
                }

                // check col: msg -> in yellow
                if (data.msg.toLowerCase().includes('unsupport')) {
                    $('td:eq(4)', row).addClass('m_yellowLight')
                }
            },
            // end colorize

            // Dropdown for columns
            //
            initComplete: function () {
                // Dropdown for all columns
                // this.api().columns().every( function () {

                // dropdown for some columns
                var columns = [2, 3] // Add columns here
                this.api().columns(columns).every(function () {
                    var column = this
                    var select = $('<select class="logreSelects"><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            )

                            column.search(val ? '^' + val + '$' : '', true, false).draw()
                        })

                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    })
                })
            }
            // End Dropdown for columns

        })

        console.log('syslogStart ::: Finished initializing the DataTable')
    })
}

/**
* @name syslogLoad
* @summary Starts the update process
* @description Destroys the current DataTable and reloads the syslog data
* @memberof renderer
*/
function syslogLoad () {
    $('#example').DataTable().destroy() // destroy DataTable
    utils.writeConsoleMsg('info', 'syslogLoad ::: Destronyed the old syslog datatable')
    syslogStart() // reload data & re-init Datatable
}

/**
* @name checkDisplaySize
* @summary Gets the display size and adjusts the window according to it
* @description Gets the display size and adjusts the window size to it. In addition the window gets centered (see main.js)
* @memberof renderer
*/
function checkDisplaySize () {
    // get current screen size
    var monitorWidth = screen.width
    var monitorHeight = screen.height
    utils.writeConsoleMsg('info', 'checkDisplaySize ::: Detected screen size is: ' + monitorWidth + 'x' + monitorHeight)

    // set new window size
    var windowWidth = monitorWidth * 0.8
    var windowHeight = monitorHeight * 0.8

    // resize & center window
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('resize-me-please', windowWidth, windowHeight)
}

/**
* @name openURL
* @summary Opens a supllied url in default browser
* @description Opens a supllied url in default browser
* @param url - URL string which contains the target url
* @memberof renderer
*/
function openURL (url) {
    const { shell } = require('electron')
    utils.writeConsoleMsg('info', 'openURL ::: Trying to open the url: ' + url)
    shell.openExternal(url)
}

/**
* @name nthChar
* @summary detect the n occurance of a character in a string and returns the position
* @description detect the n occurance of a character in a string and returns the position
* @param string
* @param character
* @param n
* @memberof renderer
*/
function nthChar (string, character, n) {
    // console.log("nthChar ::: Start");

    var count = 0; var i = 0
    while (count < n && (i = string.indexOf(character, i) + 1)) {
        count++
    }
    if (count === n) return i - 1
    return NaN
}

/**
* @name openDevConsole
* @summary Opens the developer console
* @description Opens the Chrome developer console for debugging issues
* @memberof renderer
*/
function openDevConsole () {
    utils.writeConsoleMsg('info', 'openDevConsole ::: Opening Developer Console')
    const remote = require('electron').remote
    remote.getCurrentWindow().toggleDevTools()
}

/**
* @name die
* @summary Quits the electron application
* @description Quits the electron application
* @memberof renderer
*/
function die () {
    const remote = require('electron').remote
    const w = remote.getCurrentWindow()
    w.close()
}

/**
* @name checkForNewLogreRelease
* @summary Checks if there is a new logre release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the main window if an update is available.
* @memberof renderer
*/
function checkForNewLogreRelease () {
    var remoteAppVersionLatest = '0.0.0'

    var gitHubPath = 'yafp/logre' // user/repo
    var url = 'https://api.github.com/repos/' + gitHubPath + '/tags'

    $.get(url).done(function (data) {
        var versions = data.sort(function (v1, v2) {
            return semver.compare(v2.name, v1.name)
        })

        // get remote version
        var remoteAppVersionLatest = versions[0].name

        // get local version
        var localAppVersion = require('electron').remote.app.getVersion()

        utils.writeConsoleMsg('info', 'checkForNewLogreRelease ::: Local version: ' + localAppVersion)
        utils.writeConsoleMsg('info', 'checkForNewLogreRelease :::  Latest public version: ' + remoteAppVersionLatest)

        if (localAppVersion < remoteAppVersionLatest) {
            utils.writeConsoleMsg('info', 'checkForNewLogreRelease :::  Found update: ' + remoteAppVersionLatest)

            // update the updater-info text
            $('#updateInformation').html('logre ' + remoteAppVersionLatest + ' is now available. See <a href="" onClick=\'openURL("https://github.com/yafp/logre/blob/master/CHANGELOG.md")\'>Changelog</a> for details. Download is available <a href="" onClick=\'openURL("https://github.com/yafp/logre/releases")\'>here</a>.')
            $('#updateInformation').show() // show update information
        } else {
            utils.writeConsoleMsg('info', 'checkForNewLogreRelease :::  No newer version found')
        }
    })
}

function switchTab(tab){
     utils.writeConsoleMsg('info', 'switchTab ::: ' + tab)
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
}





function calcHumanReadableTimeStamp(unixTimestamp) {

    //var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    //d.setUTCSeconds(input);
    //return d


    dateObj = new Date(unixTimestamp * 1000); 
    utcString = dateObj.toUTCString(); 
    time = utcString.slice(-11, -4); 

    return time

}



// ----------------------------------------------------------------------------
// IPC - by mainwindow on-ready
// ----------------------------------------------------------------------------

/**
* @name checkPlatform
* @summary Triggers some startup checks methos
* @description Called via ipc from main.js  when the application gets the on-ready event
* @memberof renderer
*/
require('electron').ipcRenderer.on('checkThingsOnceAtStart', function () {
    checkSupportedOperatingSystem()
})
