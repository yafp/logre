/**
* @name checkForNewLogreRelease
* @summary Checks if there is a new logre release available
* @description Compares the local app version number with the tag of the latest github release. Displays a notification in the main window if an update is available.
*/
function checkForNewLogreRelease()
{
    console.log("checkForNewLogreRelease ::: Start");

    var remoteAppVersionLatest = "0.0.0";

    var gitHubPath = 'yafp/logre';  // example repo
    var url = 'https://api.github.com/repos/' + gitHubPath + '/tags';

    $.get(url).done(function (data)
    {
        var versions = data.sort(function (v1, v2)
        {
            return semver.compare(v2.name, v1.name);
        });

        // show in UI
        //$('#result').html(versions[0].name);

        // get remote version
        var remoteAppVersionLatest = versions[0].name;

        // get local version
        var localAppVersion = require('electron').remote.app.getVersion();

        console.log("checkForNewLogreRelease ::: Local version: " + localAppVersion);
        console.log("checkForNewLogreRelease ::: Latest public version: " +remoteAppVersionLatest);

        if(localAppVersion < remoteAppVersionLatest)
        {
            console.log("checkForNewLogreRelease ::: Found update, notify user");

            // update the updater-info text
            $('#updateInformation').html('logre ' + remoteAppVersionLatest + ' is now available. See <a href="" onClick=\'openURL("https://github.com/yafp/logre/blob/master/CHANGELOG.md")\'>Changelog</a> for details. Download is available <a href="" onClick=\'openURL("https://github.com/yafp/logre/releases")\'>here</a>.');

            // show update information
            $('#updateInformation').show();
        }
        else
        {
            console.log("checkForNewLogreRelease ::: No newer version found.");
        }
    });

    console.log("checkForNewLogreRelease ::: End");
}


/**
* @name checkSupportedOperatingSystem
* @summary Checks if the operating system is supported or not
* @description Checks if the operating system is linux. If it isnt a modal error is displayed which results in closing the app after confirmation.
*/
function checkSupportedOperatingSystem()
{
    console.log("checkSupportedOperatingSystem ::: Start");

    var userPlatform = process.platform;
    console.log("checkSupportedOperatingSystem ::: Detected operating system as: " + userPlatform);

    if(userPlatform === "linux")
    {
        console.log("checkSupportedOperatingSystem ::: Operating system " + userPlatform + " is fine." );
    }
    else
    {
        // set error message
        $( ".errorText" ).append( "<p>" + userPlatform + " is currently not supported.</p>" );

        // show  error dialog
        //
        $('#myModal').modal('show');
        //$('#myModal').modal('toggle');
        //$('#myModal').modal('hide');

        console.error("checkSupportedOperatingSystem ::: Operating system " + userPlatform + " is not supported." );
    }

    console.log("checkSupportedOperatingSystem ::: End");
}


/**
* @name checkForSyslogExistance
* @summary Checks if /var/log/syslog exists or ont
* @description Checks if /var/log/syslog exists. If not a modal error is displayed which results in closing the app after confirmation.
*/
function checkForSyslogExistance()
{
    console.log("checkForSyslogExistance ::: Start");

    // requirement to read from file
    var fs = require('fs');

    var logFile = "/var/log/syslog";

    if (fs.existsSync(logFile))
    {
        console.log("checkForSyslogExistance ::: Found logfile: " + logFile);
    }
    else
    {
        console.error("checkForSyslogExistance ::: Unable to find: " + logFile);

        // set error message
        $( ".errorText" ).append("<p>Unable to find " + logFile + ".</p>" );

        // show  error dialog
        //
        $("#myModal").modal("show");
        //$("#myModal").modal("toggle");
        //$("#myModal").modal("hide");
    }

    console.log("checkForSyslogExistance ::: End");
}


/**
* @name initApp
* @summary Fetches data from syslog and builds the DataTable
* @description Reads entire syslog file, puts the data in arrays and loads the data into the DataTable
*/
function initApp()
{
    console.log("initApp ::: Start");

    // init select2
    $("#logSource").select2();

    // creating empty arrays
    var arrayLogDate = [];
    var arrayLogSrc = [];
    var arrayLogApp = [];
    var arrayLogMsg= [];

    // Read from file
    //
    // source: https://stackoverflow.com/questions/6831918/node-js-read-a-text-file-into-an-array-each-line-an-item-in-the-array
    //

    // requirement to read from file
    var fs = require("fs");

    var syslogLocation = "/var/log/syslog";

    console.log("initApp ::: Trying to read from: " + syslogLocation);

    // Synchronous
    /*
    var array = fs.readFileSync('file.txt').toString().split("\n");
    for(i in array) {
        console.log(array[i]);
    }
    */

    // Asynchronous
    fs.readFile(syslogLocation, function(err, data)
    {
      if(err)
      {
          throw err;
      }

      var array = data.toString().split("\n"); // fill array with content of syslog-file

        // process file content line by line
          for(i in array)
          {
            var curLine = array[i];

                // example
                // Apr 10 00:39:01 localhost CRON[1856]: (root) CMD (  [ -x /usr/lib/php/sessionclean ] && if [ ! -d /run/systemd/system ]; then /usr/lib/php/sessionclean; fi)

                var targetPosFirstSplit = nthChar(curLine, " ", 3);
                var targetPosSecondSplit = nthChar(curLine, " ", 4);
                var targetPosThirdSplit = nthChar(curLine, " ", 5);

                // split line into several arrays
                var logDate  = curLine.substr( 0, targetPosFirstSplit );
                var logSrc = curLine.substr( targetPosFirstSplit +1, (targetPosSecondSplit - targetPosFirstSplit -1) );
                var logApp = curLine.substr( targetPosSecondSplit +1, targetPosThirdSplit - targetPosSecondSplit );
                // clean logApp
                // default value looks like that: cron[PID]:
                // target looks like: cron
                var targetPosPIDSplit = nthChar(logApp, "[", 1);
                logApp = logApp.substr(0, targetPosPIDSplit);

                var logMsg = curLine.substr( targetPosThirdSplit +1);

                // add values to specific array
                arrayLogDate.push(logDate);
                arrayLogSrc.push(logSrc);
                arrayLogApp.push(logApp);
                arrayLogMsg.push(logMsg);

                // logging
                //
                //console.log(logDate);
                //console.log(logSrc);
                //console.log('_'+logSrc+'_');
                //console.log(logMsg);
                //console.log("--");
                //console.error(arrayLogDate.length);
            }

            console.log("initApp ::: finished reading source file. Amount of rows: "+arrayLogDate.length);


        // Creating DataSet
        //
        console.log("initApp ::: Generating dataset for DataTable");
        var dataSet2 = [];
        var arrayLength = arrayLogDate.length;
        for (var i = 0; i < arrayLength -1; i++)
        {
          dataSet2.push({id: i, date:arrayLogDate[i], source:arrayLogSrc[i], app:arrayLogApp[i], msg:arrayLogMsg[i]});
      }
      console.log("initApp ::: Finished generating dataset for DataTable");


        // init datatable
        //
        //$('#example').DataTable();
        var table = $("#example").DataTable( {
          "order": [[ 0, "desc" ]], // order based on ID
          data: dataSet2,
          columns: [
          { data: "id" },
          { data: "date" },
          { data: "source" },
          { data: "app" },
          { data: "msg" }
          ],

        dom: "Brtip",
        buttons: [
            "copy", "csv", "excel", "pdf"
        ],

        // pagination
        "pagingType": "numbers",

          // colorize the different event-types
          //
          "rowCallback": function( row, data )
          {
            // check col: source
            if ( data.source === "localhost" )
            {
              $("td:eq(2)", row).addClass("m_greenLight");
            }

            // check col: msg -> in red
            if ( (data.msg.toLowerCase().includes("error")) || (data.msg.toLowerCase().includes("fail")) )
            {
              $("td:eq(4)", row).addClass("m_redLight");
            }
            // check col: msg -> in orange
            if ( data.msg.toLowerCase().includes("warning" ) || (data.msg.toLowerCase().includes("unable")) )
            {
              $("td:eq(4)", row).addClass("m_orangeLight");
            }

            // check col: msg -> in yellow
            if ( data.msg.toLowerCase().includes("unsupport" ))
            {
              $("td:eq(4)", row).addClass("m_yellowLight");
            }
        },
        // end colorize


        // Dropdown for columns
        //
        initComplete: function ()
        {
            // Dropdown for all columns
            //this.api().columns().every( function () {

            // dropdown for some columns
            columns = [2, 3]; // Add columns here
            this.api().columns(columns).every(function ()
            {
              var column = this;
              var select = $('<select class="logreSelects"><option value=""></option></select>')
              .appendTo( $(column.footer()).empty() )
              .on( 'change', function ()
              {
                var val = $.fn.dataTable.util.escapeRegex(
                  $(this).val()
                  );

                column.search( val ? '^'+val+'$' : '', true, false ).draw();
            } );

              column.data().unique().sort().each( function ( d, j )
              {
                select.append( '<option value="'+d+'">'+d+'</option>' );
            } );
          } );
        }
        // End Dropdown for columns



    } );


        // Custom search field for DataTable
        $("#myInputTextField").keyup(function()
        {
            table.search($(this).val()).draw() ;
        });

        console.log("initApp ::: Finished initializing the DataTable");

    });

    console.log("initApp ::: End");
}


/**
* @name update
* @summary Starts the update process
* @description Destroys the current DataTable and reloads the syslog data
*/
function update()
{
    console.log("update ::: Start");

    // destroy DataTable
    //
    //$("#example").DataTable().clear();
    $("#example").DataTable().destroy();
    console.log("update ::: Destroyed old DataTable");

    // reload data
    initApp();

    console.log("update ::: End");
}



/**
* @name checkDisplaySize
* @summary Gets the display size and adjusts the window according to it
* @description Gets the display size and adjusts the window size to it. In addition the window gets centered (see main.js)
*/
function checkDisplaySize()
{
    console.log("checkDisplaySize ::: Start");

    // get current screen size
    var monitorWidth = screen.width;
    var monitorHeight = screen.height;
    console.log("checkDisplaySize ::: Detected screen size is: " + monitorWidth + "x" + monitorHeight);

    // set new window size
    var windowWidth = monitorWidth * 0.8;
    var windowHeight = monitorHeight * 0.8;


    // resize & center window
    //
    const {ipcRenderer} = require("electron");
    ipcRenderer.send("resize-me-please", windowWidth, windowHeight);

    console.log("checkDisplaySize ::: End");
}


/**
* @name checkRequirements
* @summary Central launcher for several init scripts
* @description Gets executed on app launch and starts several other methods
*/
function checkRequirements()
{
    console.log("checkRequirements ::: Start");
    checkSupportedOperatingSystem();
    checkForSyslogExistance();
    checkDisplaySize();
    console.log("checkRequirements ::: End");
}


/**
* @name openURL
* @summary Opens a supllied url in default browser
* @description Opens a supllied url in default browser
* @param url - URL string which contains the target url
*/
function openURL(url)
{
    console.log("openURL ::: Start");

    const {shell} = require("electron");
    console.log("openURL ::: Trying to open the url: " + url);
    shell.openExternal(url);

    console.log("openURL ::: End");
}


/**
* @name nthChar
* @summary detect the n occurance of a character in a string and returns the position
* @description detect the n occurance of a character in a string and returns the position
* @param string
* @param character
* @param n
*/
function nthChar(string, character, n)
{
    //console.log("nthChar ::: Start");

    var count= 0, i=0;
    while(count<n && (i=string.indexOf(character,i)+1))
    {
      count++;
  }
  if(count === n) return i-1;
  return NaN;
}


/**
* @name openDevConsole
* @summary Opens the developer console
* @description Opens the Chrome developer console for debugging issues
*/
function openDevConsole()
{
    console.log("openDevConsole ::: Start");

    console.log("openDevConsole ::: Opening Developer Console");
    const remote = require("electron").remote;
    remote.getCurrentWindow().toggleDevTools();

    console.log("openDevConsole ::: End");
}


/**
* @name keyListener
* @summary Initialize an event listener
* @description Key listener for F5 and F12
*/
function keyListener()
{
    document.addEventListener("keydown", function (e)
    {
        //console.log("keyListener ::: EventListener");

        if (e.which === 123) // F12 = Open developer console
        {
            console.log("keyListener ::: Event: KeyPress F12");
            openDevConsole();
        }
        else if (e.which === 116) // F5 = reload
        {
            console.log("keyListener ::: Event: KeyPress F5");
            //location.reload();
            update();
        }
    });
}



/**
* @name die
* @summary Quits the electron application
* @description Quits the electron application
*/
function die()
{
    console.log("die ::: Start");

    // quit
    //
    const remote = require("electron").remote;
    let w = remote.getCurrentWindow();
    w.close();
}
