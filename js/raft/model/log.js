
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3*/

define(["./log_entry", "./bbox"], function (LogEntry, BBox) {
    function Log() {
        this.visible = true;
        this.commitIndex = 0;
        this.entries = [];
    }

    /**
     * Appends a log entry to the log.
     *
     * @param {Number}
     * @param {Number}
     * @param {String}
     * @param {Log}
     */
    Log.prototype.append = function (index, term, command) {
        var entry = new LogEntry(index, term, command);
        this.entries = this.entries.slice(0, index);
        this.entries.push(entry);
        return this;
    };

    /**
     * Determines the bounding box of the log.
     */
    Log.prototype.bbox = function () {
        var i, bbox;
        if (!this.visible || this.entries.length === 0) {
            return null;
        }
        bbox = this.entries[0].bbox();
        for (i = 1; i < this.entries.length; i += 1) {
            bbox = this.entries[i].bbox();
        }
        return bbox;
    };

    Log.prototype.clone = function () {
        var clone = new Log();
        clone.visible = this.visible;
        clone.entries = this.entries.map(function (item) { return item.clone(); });
        return clone;
    };

    return Log;
});
