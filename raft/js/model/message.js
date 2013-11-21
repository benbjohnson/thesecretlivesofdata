
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    var nextId = 0;

    function Message() {
        nextId += 1;
        this.id = nextId;
        this.source = null;
        this.target = null;
        this.sendTime(0);
        this.recvTime(0);
        this.text = "";
    }

    Message.prototype.source = function (value) {
        if (arguments.length === 0) {
            return this._source;
        }
        this._source = value;
        return this;
    };

    Message.prototype.target = function (value) {
        if (arguments.length === 0) {
            return this._target;
        }
        this._target = value;
        return this;
    };

    Message.prototype.sendTime = function (value) {
        if (arguments.length === 0) {
            return this._sendTime;
        }
        this._sendTime = value;
        return this;
    };

    Message.prototype.recvTime = function (value) {
        if (arguments.length === 0) {
            return this._recvTime;
        }
        this._recvTime = value;
        return this;
    };

    Message.prototype.clone = function () {
        var i, clone = new Message();
        clone.text = this.text;
        return clone;
    };

    return Node;
});
