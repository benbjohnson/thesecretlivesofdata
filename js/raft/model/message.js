
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
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
