
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3*/

define(["./bbox"], function (BBox) {
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
        return new BBox(this.y, this.x + this.w, this.y + this.h, this.x);
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
