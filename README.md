# brackets-autosaver
[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)


**Finally!**

A **Brackets** extension that saves your file **as you type**. No need to constantly press Ctrl/CMD + S. It helps you achieve a perfect workflow with file watchers (*Gulp, Grunt, npm, CodeKit*...).

Simple demo gif:

![brackets-autosaver](img/demo.gif)

## How does it work?
Brackets-autosaver hooks to key presses. To avoid triggering a file save command on every-single-keypress the extension waits **400ms** from the **last** key pulsation.

So once you're finished typing a few words or a simple correction, **then** it saves the document (always the one you just edited).

## Is it always on?
Nope. You can turn this feature on and off easily from the File menu. So just check or uncheck **File -> Enable auto saving**.

## How to install this awesome thing?
Like any other Brackets extension. Either look for it within Brackets extension manager or download this repo and drop it on Brackets.


**Feel free to open any issues, I'll take care of them.**
