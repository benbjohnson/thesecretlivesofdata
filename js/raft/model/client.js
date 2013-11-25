
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    function Client(id) {
        this.id = id;
    }

    Client.prototype.clone = function () {
        var i, clone = new Client();
        clone.id = this.id;
        return clone;
    };

    return Client;
});
