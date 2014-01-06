
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, tsld, playback*/

define([], function () {
    function Client(model, id) {
        playback.DataObject.call(this, model);
        this.id = id;
        this._value = "";
    }

    Client.prototype = new playback.DataObject();
    Client.prototype.constructor = Client;

    /**
     * Determines the bounding box of the client.
     */
    Client.prototype.bbox = function () {
        return tsld.bbox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
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
        return clone;
    };

    return Client;
});
