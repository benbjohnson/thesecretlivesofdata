
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3, tsld*/

define([], function () {
    function LogEntry(index, term, command) {
        this.index = index;
        this.term = term;
        this.command = command;
    }

    LogEntry.prototype = playback.dataObject();
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
        var m = this.command.match(/^SET (\d+)$/);
        if (m !== null) {
            node._value = parseInt(m[1], 10);
            return;
        }
    };

    LogEntry.prototype.clone = function () {
        var clone = new LogEntry();
        clone.index = this.index;
        clone.term = this.term;
        clone.command = this.command;
        return clone;
    };

    return LogEntry;
});
