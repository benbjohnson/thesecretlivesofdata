
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, tsld*/

define([], function () {
    var nextId = 0;

    function Message(model, id) {
        playback.DataObject.call(this, model);
        this.id = (id === undefined ? nextId : 0);
        this.source = null;
        this.target = null;
        this.sendTime = 0;
        this.recvTime = 0;
        this.text = "";

        if (id === undefined) {
            nextId += 1;
        }
    }

    Message.prototype = new playback.DataObject();
    Message.prototype.constructor = Message;

    /**
     * Retrieves the message type from the payload.
     */
    Message.prototype.type = function () {
        return this.payload !== null && this.payload !== undefined ? this.payload.type : "";
    };

    /**
     * Determines the bounding box of the message.
     */
    Message.prototype.bbox = function () {
        return tsld.bbox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
    };

    Message.prototype.clone = function (model) {
        var i, clone = new Message(model);
        clone.id       = this.id;
        clone.source   = this.source;
        clone.target   = this.target;
        clone.payload  = this.payload;
        clone.sendTime = this.sendTime;
        clone.recvTime = this.recvTime;
        return clone;
    };

    return Message;
});
