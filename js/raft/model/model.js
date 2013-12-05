
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
        this.domains = {
            x: [0, 100],
            y: [0, 100],
        };
    }

    Model.prototype = playback.model();

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
     * Zooms in on a given node or zooms out to full screen.
     */
    Model.prototype.zoom = function (nodes) {
        var i, node,
            x = {min: 0, max: 100},
            y = {min: 0, max: 100};

        // Zoom out if no nodes are specified.
        if (nodes === null) {
            this.domains.x = [0, 100];
            this.domains.y = [0, 100];
            return;
        }

        // Find the x and y ranges to constrain the zoom bbox.
        if (typeof(nodes) !== "array") {
            nodes = [nodes];
        }
        for (i = 0; i < nodes.length; i += 1) {
            node = nodes[i];
            x.min = Math.max(x.min, node.x - node.r);
            x.max = Math.min(x.max, node.x + node.r);
            y.min = Math.max(y.min, node.y - node.r);
            y.max = Math.min(y.max, node.y + node.r);
        }

        this.domains.x = [x.min, x.max];
        this.domains.y = [y.min, y.max];
    };

    /**
     * Removes all data from the model.
     */
    Model.prototype.clear = function () {
        this.title = this.subtitle = "";
        this.nodes.removeAll();
        this.clients.removeAll();
        this.messages.removeAll();
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
