
"use strict";
/*jslint browser: true, nomen: true*/

var Tsld = require('./tsld'),
    bind = require('bind');

module.exports = new Tsld();

bind(module.exports, module.exports.init);
bind(module.exports, module.exports.initialize);
