
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback*/

define(["./controls", "./client", "./message", "./node"], function (Controls, Client, Message, Node) {
    function Model() {
        this.title = "";
        this.subtitle = "";
        this.controls = new Controls(this);
        this.nodes = playback.set(Node);
        this.clients = playback.set(Client);
        this.messages = playback.set(Message);
    }

    Model.prototype = playback.model();

    /**
     * Retrieves the HTML 
     */
    Model.prototype.nextButton = function () {
    };

    /**
     * Finds either a node or client by id.
     */
    Model.prototype.find = function (id) {
        var ret = null;
        if (ret === null) {
            ret = this.nodes.find(id);
        }
        if (ret === null) {
            ret = this.clients.find(id);
        }
        return ret;
    };

    /**
     * Performs clean up of the model at time t.
     */
    Model.prototype.tick = function (t) {
        // Remove messages that have already been received.
        this.messages.filter(function(message) {
            return (message.recvTime > t);
        });
    };

    /**
     * Sends a message between two nodes.
     *
     * @return {Message}
     */
    Model.prototype.send = function (source, target, duration) {
        var message = this.messages.create();
        message.source = (typeof(source) == "string" ? source : source.id);
        message.target = (typeof(target) == "string" ? target : target.id);
        message.sendTime = this.playhead();
        message.recvTime = message.sendTime + duration;
        return message;
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
