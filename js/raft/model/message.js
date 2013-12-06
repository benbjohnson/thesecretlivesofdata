
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./bbox"], function (BBox) {
    var nextId = 0;

    function Message(id) {
        nextId += 1;
        this.id = nextId;
        this.source = null;
        this.target = null;
        this.sendTime = 0;
        this.recvTime = 0;
        this.text = "";
    }

    /**
     * Determines the bounding box of the message.
     */
    Message.prototype.bbox = function () {
        return new BBox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
    };

    Message.prototype.clone = function () {
        var i, clone = new Message();
        clone.id = this.id;
        clone.source = this.source;
        clone.target = this.target;
        clone.sendTime = this.sendTime;
        clone.recvTime = this.recvTime;
        return clone;
    };

    return Message;
});
