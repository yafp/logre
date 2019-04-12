/**
* @name update
* @summary Starts the update process
* @description
*/
function update()
{
    console.log("update ::: Start");

    // destroy DataTable
    //
    //$('#example').DataTable().clear();
    $('#example').DataTable().destroy();
    console.log("update ::: Destroyed old DataTable");

    // reload data
    initApp();

    console.log("update ::: End");
}


/**
* @name checkRequirements
* @summary Central launcher for severak init scripts
* @description
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
* @name checkDisplaySize
* @summary Gets the display size and adjusts the window according to it
* @description
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


    // resize window
    //
    const {ipcRenderer} = require('electron');
    ipcRenderer.send("resize-me-please", windowWidth, windowHeight)

    console.log("checkDisplaySize ::: End");
}


/**
* @name checkSupportedOperatingSystem
* @summary Checks if the operating system is supported or not
* @description
*/
function checkSupportedOperatingSystem()
{
    console.log("checkSupportedOperatingSystem ::: Start");

    var userPlatform = process.platform;
    console.log("checkSupportedOperatingSystem ::: Detected operating system as: " + userPlatform);

    if(userPlatform == "linux")
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
* @description
*/
function checkForSyslogExistance()
{
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
        //$('#myModal').modal('toggle');
        //$('#myModal').modal('hide');
    }
}


/**
* @name openURL
* @summary Opens a supllied url in default browser
* @description
* @param url - URL string which contains the target url
*/
function openURL(url)
{
    console.log("openURL ::: Start");

    const {shell} = require('electron');
    console.log('openURL ::: Trying to open the url: ' + url);
    shell.openExternal(url);

    console.log("openURL ::: End");
}


/**
* @name nthChar
* @summary detect the n occurance of a character in a string and returns the position
* @description
* @param string
* @param character
* @param n
*/
function nthChar(string, character, n)
{
    console.log("nthChar ::: Start");

    var count= 0, i=0;
    while(count<n && (i=string.indexOf(character,i)+1))
    {
      count++;
  }
  if(count== n) return i-1;
  return NaN;
}


/**
* @name initApp
* @summary Fetches data from syslog and builds the DataTable
* @description
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
    var fs = require('fs');

    // Asynchronous
    fs.readFile('/var/log/syslog', function(err, data)
    {
      if(err) throw err;

      var array = data.toString().split("\n"); // fill array with content of syslog-file

        // process file content line by line
          for(i in array)
          {
            var curLine = array[i];

                // example
                // Apr 10 00:39:01 localhost CRON[1856]: (root) CMD (  [ -x /usr/lib/php/sessionclean ] && if [ ! -d /run/systemd/system ]; then /usr/lib/php/sessionclean; fi)

                var targetPosFirstSplit = nthChar(curLine, ' ', 3);
                var targetPosSecondSplit = nthChar(curLine, ' ', 4);
                var targetPosThirdSplit = nthChar(curLine, ' ', 5);

                // split line into several arrays
                var logDate  = curLine.substr( 0, targetPosFirstSplit );
                var logSrc = curLine.substr( targetPosFirstSplit +1, (targetPosSecondSplit - targetPosFirstSplit -1) );
                var logApp = curLine.substr( targetPosSecondSplit +1, targetPosThirdSplit - targetPosSecondSplit );
                // clean logApp
                // default value looks like that: cron[PID]:
                // target looks like: cron
                var targetPosPIDSplit = nthChar(logApp, '[', 1);
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
        var table = $('#example').DataTable( {
          "order": [[ 0, "desc" ]], // order based on ID
          data: dataSet2,
          columns: [
          { data: "id" },
          { data: "date" },
          { data: "source" },
          { data: "app" },
          { data: "msg" }
          ],

        dom: 'Brtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],

        // pagination
        "pagingType": "numbers",

          // colorize the different event-types
          //
          "rowCallback": function( row, data )
          {
            // check col: source
            if ( data['source'] === "localhost" )
            {
              $("td:eq(2)", row).addClass("m_greenLight");
            }

            // check col: msg
            if ( (data['msg'].toLowerCase().includes("error")) || (data['msg'].toLowerCase().includes("fail")) )
            {
              $("td:eq(4)", row).addClass("m_redLight");
            }
            // check col: msg
            if ( data['msg'].toLowerCase().includes("warning" ))
            {
              $("td:eq(4)", row).addClass("m_orangeLight");
            }

            // check col: msg
            if ( data['msg'].toLowerCase().includes("unsupport" ))
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
              var select = $('<select class="logfiSelects"><option value=""></option></select>')
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
        $('#myInputTextField').keyup(function()
        {
            table.search($(this).val()).draw() ;
        })

        console.log("initApp ::: Finished initializing the DataTable");


    });

        // Synchronous
        /*
        var array = fs.readFileSync('file.txt').toString().split("\n");
        for(i in array) {
            console.log(array[i]);
        }
        */

    console.log("initApp ::: End");
}


/**
* @name initKeyListener
* @summary Initialize an event listener
* @description
*/
function initKeyListener()
{
    document.addEventListener("keydown", function (e)
    {
        console.log("initKeyListener ::: EventListener");

        if (e.which === 123) // F12 = Open developer console
        {
            console.log("initKeyListener ::: Event: KeyPress F12");
            openDevConsole();
        }
        else if (e.which === 116) // F5 = reload
        {
            console.log("initKeyListener ::: Event: KeyPress F5");
            //location.reload();
            update();
        }
    });
}


/**
* @name openDevConsole
* @summary Opens the developer console
* @description
*/
function openDevConsole()
{
    console.log("openDevConsole ::: Start");

    console.log("openDevConsole ::: Opening Developer Console");
    const remote = require('electron').remote;
    remote.getCurrentWindow().toggleDevTools();

    console.log("openDevConsole ::: End");
}


/**
* @name die
* @summary Quits the electron application
* @description
*/
function die()
{
    console.log("die ::: Start");

    // quit
    //
    const remote = require('electron').remote
    let w = remote.getCurrentWindow()
    w.close()
}
