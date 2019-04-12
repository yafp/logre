[![Build Status](https://travis-ci.org/yafp/logre.svg?branch=master)](https://travis-ci.org/yafp/logre)


# logre
## about
logre is a linux logfile reader. Right now it only supports syslog. It is based on electron and uses several javascript libraries to offer some conveniences.

## ui
SCREENSHOT MISSING


## changelog
Please see the [changlog](docs/CHANGELOG.md) for more details.



## install
### linux
#### .deb

```sudo dpkg -i /path/to/local.deb```

#### AppImage
* Copy the AppImage to the desired location
* Make it executable: ```chmod +x /path/to/AppImage```
* Execute it

#### Snap


## howto
### execute from cli
* navigate to main folder
* execute: ```npm start```

### Add electron-builder to devDependencies
* execute: ```npm install electron-builder --save-dev```

### build from cli
* navigate to main folder
* execute: ```npm run dist```


## links
### for electron beginners
* Example electron project: https://github.com/electron/electron-quick-start
* package.json validator: http://package-json-validator.com/
* Project boilerplate: https://github.com/szwacz/electron-boilerplate
* Building: https://medium.com/how-to-electron/a-complete-guide-to-packaging-your-electron-app-1bdc717d739f
* Linux building configuration: https://www.electron.build/configuration/linux
