<p align="center">
  <a href="#"><img src="https://raw.githubusercontent.com/yafp/logre/master/.github/images/logo/128x128.png" width="128"></a>
</p>

<div align="center">
  <h1>logre</h1>
  <h2>changelog</h2>

</div>


This project is using [Semantic Versioning](https://semver.org/).

  ```
  MAJOR.MINOR.PATCH
  ```

* ```MAJOR``` version (incompatible API changes etc)
* ```MINOR``` version (adding functionality)
* ```PATCH``` version (bug fixes)

The following categories are used:

* ```Added```: for new features
* ```Changed```: for changes in existing functionality.
* ```Deprecated```: for soon-to-be removed features.
* ```Removed```: for now removed features.
* ```Fixed```: for any bug fixes.
* ```Security```: in case of vulnerabilities.

***

### logre 1.2.0 (2020xxyy) CUR DEV
#### ```Added```
* Added about window
* Added support for journalctl

#### ```Changed```
* Dependencies (updated)
  * Updated electrom from 4.2.12 to 8.1.1
  * updated electron-builder from 20.44.4 to 22.4.1
* Dependencies (new)
  * Added standardx 5.0.0
  * Added snazzy 8.0.0
  * Added about-window 1.13.2
  * Added noty 3.2.0-beta
  * Added popper.js 1.16.1
  * Added animate.css 3.7.2
  * Added electron-log 4.1.0
  * Added journalctl
  * Added fontAwesome
  * Added which
* Js Libraries
  * Bootstrap is now installed using npm
  * jQuery is now installed using npm

#### ```Removed```
* Removed the footer
* Removed some unused icon image files

***

### logre 1.1.0 (20190425)
####  ```Added```
* Added link to releases to help menu
* Added update-check on startup
* Added placeholder text to search field
* Added new pattern 'unable' to msg coloring
* Added a basic jsdoc based documentation for the logre javascript code

#### ```Changed```
* Optimized console.log usage

#### ```Removed```
* Removed print option from DataTable Buttons

#### ```Fixed```
* Several minor fixes based on codacy warnings
* Fixed previously not display app icon in window title and dock (tested for .deb only)

***

### logre 1.0.0 (20190423)
####  ```Added```
* Initial version
* Electron: 4.1.4
* Javascript Libraries
  * jQuery: 3.3.1
  * BootStrap: 4.3.1
  * DataTables: 1.10.18
  * Select2: 4.0.5
* Working reader for /var/log/syslog
* Results displayed in DataTable
* Export functions of results via DataTable Buttons
* F12 opens developer console
* F5 reloads all log entries
* window size and position is handled on launch
* detects operating system on launch
* checks if /var/log/syslog exists
