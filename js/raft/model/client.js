
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./bbox"], function (BBox) {
    function Client(id) {
        this.id = id;
    }

    Client.prototype = playback.dataObject();
    Client.prototype.constructor = Client;

    /**
     * Determines the bounding box of the client.
     */
    Client.prototype.bbox = function () {
        return new BBox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
    };

    Client.prototype.clone = function () {
        var i, clone = new Client();
        clone.id = this.id;
        return clone;
    };

    return Client;
});
