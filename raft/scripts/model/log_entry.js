
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3, tsld*/

define([], function () {
    function LogEntry(model, index, term, command, callback) {
        playback.DataObject.call(this, model);
        this.index = index;
        this.term = term;
        this.command = command;
        this.callback = (callback !== undefined ? callback : null);
    }

    LogEntry.prototype = new playback.DataObject();
    LogEntry.prototype.constructor = LogEntry;

    /**
     * Determines the bounding box of the log entry.
     */
    LogEntry.prototype.bbox = function () {
        return tsld.bbox(this.y, this.x + this.w, this.y + this.h, this.x);
    };

    /**
     * Determines the bounding box of the log entry.
     */
    LogEntry.prototype.bbox = function () {
        return tsld.bbox(this.y, this.x + this.w, this.y + this.h, this.x);
    };

    /**
     * Applies the log to a node.
     */
    LogEntry.prototype.applyTo = function (node) {
        var m = this.command.match(/^(\w+) (\d+)$/);
        switch (m[1]) {
        case "ADD":
            node._value += parseInt(m[2], 10);
            break;
        case "SET":
            node._value = parseInt(m[2], 10);
            break;
        case "SUB":
            node._value -= parseInt(m[2], 10);
            break;
        }
        
        if (this.callback !== null) {
            this.callback();
        }
    };

    LogEntry.prototype.clone = function (model) {
        var clone = new LogEntry(model, this.index, this.term, this.command);
        clone.index = this.index;
        clone.term = this.term;
        clone.command = this.command;
        return clone;
    };

    return LogEntry;
});
