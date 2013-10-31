
"use strict";
/*jslint browser: true, nomen: true*/

var Raft      = require('./raft/raft');

function Tsld() {
    this.initialized = false;
}

Tsld.prototype.initialize = function (options) {
    this.initialized = true;
};


module.exports = Tsld;

Tsld.VERSION = Tsld.prototype.VERSION = '0.0.1';

