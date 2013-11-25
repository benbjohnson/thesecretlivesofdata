
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback*/

define(["./dialog", "./client", "./message", "./node"], function (Dialog, Client, Message, Node) {
    function Model() {
        this.dialog = new Dialog();
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
        clone.dialog = this.dialog.clone();
        clone.nodes = this.nodes.clone();
        clone.clients = this.clients.clone();
        clone.messages = this.messages.clone();
        return clone;
    };

    return Model;
});
