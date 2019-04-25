# logre
## changelog

### logre 1.1.0 (20190xyy)
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




## Versioning

  ```
  MAJOR.MINOR.PATCH
  ```

* ```MAJOR``` version (incompatible API changes etc)
* ```MINOR``` version (adding functionality)
* ```PATCH``` version (bug fixes)


### Categories
* ```Added```: for new features
* ```Changed```: for changes in existing functionality.
* ```Deprecated```: for soon-to-be removed features.
* ```Removed```: for now removed features.
* ```Fixed```: for any bug fixes.
* ```Security```: in case of vulnerabilities.
