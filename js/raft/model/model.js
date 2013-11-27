
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback*/

define(["./client", "./message", "./node"], function (Client, Message, Node) {
    function Model() {
        this.title = "";
        this.subtitle = "";
        this.nodes = playback.set(Node);
        this.clients = playback.set(Client);
        this.messages = playback.set(Message);
    }

    Model.prototype = playback.model();

    /**
     * Performs clean up of the model at time t.
     */
    Model.prototype.tick = function (t) {
        // Remove messages that have already been received.
        this.messages.filter(function(message) {
            return (message.recvTime < t);
        });
    };

    /**
     * Clones the model.
     */
    Model.prototype.clone = function () {
        var i, clone = new Model();
        clone.title = this.title;
        clone.subtitle = this.subtitle;
        clone.nodes = this.nodes.clone();
        clone.clients = this.clients.clone();
        clone.messages = this.messages.clone();
        return clone;
    };

    return Model;
});
