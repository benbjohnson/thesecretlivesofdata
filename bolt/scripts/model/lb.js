
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, tsld, playback*/

define([], function () {
    function LB(model, id) {
        playback.DataObject.call(this, model);
        this.id = id;
        this._value = "";
        
        this._url = "LB";
        this._log = [];
    }

    LB.prototype = new playback.DataObject();
    LB.prototype.constructor = LB;

    /**
     * Determines the bounding box of the client.
     */
    LB.prototype.bbox = function () {
        var bbox = tsld.bbox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
        bbox = bbox.union(this.logbbox());
        return bbox;
    };
    LB.prototype.logbbox = function () {
        var i, bbox;
        if (this._log.length === 0) {
            return null;
        }
        bbox = this._log[0].bbox();
        for (i = 1; i < this._log.length; i += 1) {
            bbox = this._log[i].bbox();
        }
        return bbox;
    };

    /**
     * Returns the value of the client.
     */
    LB.prototype.value = function (value) {
        if (arguments.length === 0) {
            return this._value;
        }
        this._value = value;
        return this;
    };

    /**
     * Retrieves the log entries.
     */
    LB.prototype.log = function () {
        return this._log;
    };

    LB.prototype.url = function () {
        return this._url;
    };

    /**
     * Sends a command to a node.
     */
    LB.prototype.send = function (target, command) {
        var message, self = this;
        message = this.model().send(this, target, command, function () {
            self.model().find(target.id).execute(command, function() {
                self.model().send(target, self, null, function() {
                    self.dispatchChangeEvent("recv");
                });
            });
        });
        self.dispatchChangeEvent("send");
        return message;
    };

    /**
     * Dispatches the event from the client and from the model.
     */
    LB.prototype.dispatchEvent = function (event) {
        playback.DataObject.prototype.dispatchEvent.call(this, event);
        this.model().dispatchEvent(event);
    };

    LB.prototype.clone = function (model) {
        var clone = new LB(model, this.id);
        clone._value = this._value;
        clone._url = this._url;
        clone._log = this._log.map(function (entry) { return entry.clone(model); });
        return clone;
    };

    return LB;
});
