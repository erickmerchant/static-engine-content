# static-engine-read

[![Dependency Status](https://david-dm.org/erickmerchant/static-engine-read.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine-read) [![devDependency Status](https://david-dm.org/erickmerchant/static-engine-read/dev-status.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine-read#info=devDependencies) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

This is a plugin for [static-engine](https://github.com/erickmerchant/static-engine). It takes a string that's passed to glob. It adds an object to the array for every file found. Each of those objects has two properties, `file` which is the file found, and `content` that is the content of that file.

```javascript

var engine = require('static-engine');
var content = require('static-engine-read');
var pluginA = require('plugin-a');

engine([
    pluginA,
    content('./content/*')
]);

```
