<p align="center">
  <a href="#"><img src="https://raw.githubusercontent.com/yafp/logre/master/.github/images/logo/128x128.png" width="128"></a>
</p>

<div align="center">
  <h1>logre</h1>

a minimal log reader

available for:

![linux](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/platform/linux_32x32.png)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/390dae4f9f4443c88f4a836a0d37a9a1)](https://www.codacy.com/app/yafp/logre?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=yafp/logre&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.org/yafp/logre.svg?branch=master)](https://travis-ci.org/yafp/logre)
![GitHub release](https://img.shields.io/github/release/yafp/logre.svg)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/yafp/logre/latest.svg)
![GitHub](https://img.shields.io/github/license/yafp/logre.svg)

![logo](https://raw.githubusercontent.com/yafp/logre/master/.github/ui_latest.png)

</div>


# logre
## about
logre is a linux logfile reader. Right now it only supports ```syslog```. It is based on electron and uses several javascript libraries to offer some conveniences.
Log messages can be filtered, sorted and exported in several formats.


## changelog
Please see the [changlog](docs/CHANGELOG.md) for more details.

## install
### linux

#### .deb
* Download the latest .deb
* execute: ```sudo dpkg -i /path/to/local/logre-file.deb```

#### AppImage
* Copy the AppImage to the desired location
* Make it executable: ```chmod +x /path/to/local/logre-file.AppImage```
* Execute it

#### Snap
* Execute: ```sudo snap install /path/to/local/logre-file.snap```
