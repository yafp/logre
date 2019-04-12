[![Build Status](https://travis-ci.org/yafp/logre.svg?branch=master)](https://travis-ci.org/yafp/logre)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/390dae4f9f4443c88f4a836a0d37a9a1)](https://www.codacy.com/app/yafp/logre?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=yafp/logre&amp;utm_campaign=Badge_Grade)

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

```
sudo dpkg -i /path/to/local.deb
```

#### AppImage
* Copy the AppImage to the desired location
* Make it executable: ```chmod +x /path/to/AppImage```
* Execute it

#### Snap


## howto
### setup
* download from github
* execute: ```npm install electron```

### Add electron-builder to devDependencies
* execute: ```npm install electron-builder --save-dev```

### execute from cli
* navigate to main folder
* execute: ```npm start```

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
