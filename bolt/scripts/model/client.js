
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, tsld, playback*/

define([], function () {
    function Client(model, id) {
        playback.DataObject.call(this, model);
        this.id = id;
        this._value = "";
        
        this._url = "client";
        this._log = [];
    }

    Client.prototype = new playback.DataObject();
    Client.prototype.constructor = Client;

    /**
     * Determines the bounding box of the client.
     */
    Client.prototype.bbox = function () {
        var bbox = tsld.bbox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
        bbox = bbox.union(this.logbbox());
        return bbox;
    };
    Client.prototype.logbbox = function () {
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
    Client.prototype.value = function (value) {
        if (arguments.length === 0) {
            return this._value;
        }
        this._value = value;
        return this;
    };

    /**
     * Retrieves the log entries.
     */
    Client.prototype.log = function () {
        return this._log;
    };

    Client.prototype.url = function () {
        return this._url;
    };

    /**
     * Sends a command to a node.
     */
    Client.prototype.send = function (target, command) {
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
    Client.prototype.dispatchEvent = function (event) {
        playback.DataObject.prototype.dispatchEvent.call(this, event);
        this.model().dispatchEvent(event);
    };

    Client.prototype.clone = function (model) {
        var clone = new Client(model, this.id);
        clone._value = this._value;
        clone._url = this._url;
        clone._log = this._log.map(function (entry) { return entry.clone(model); });
        return clone;
    };

    return Client;
});
