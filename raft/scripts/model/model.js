
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback, tsld*/

define(["./controls", "./client", "./message", "./node"], function (Controls, Client, Message, Node) {
    var DEFAULT_SIMULATION_RATE   = (1/20),
        DEFAULT_NETWORK_LATENCY   = 20 / DEFAULT_SIMULATION_RATE,
        DEFAULT_HEARTBEAT_TIMEOUT = 50 / DEFAULT_SIMULATION_RATE,
        DEFAULT_ELECTION_TIMEOUT  = 150 / DEFAULT_SIMULATION_RATE;

    function Model() {
        this.title = "";
        this.subtitle = "";
        this.defaultSimulationRate = DEFAULT_SIMULATION_RATE;
        this.defaultHeartbeatTimeout = DEFAULT_HEARTBEAT_TIMEOUT;
        this.defaultElectionTimeout = DEFAULT_ELECTION_TIMEOUT;
        this.simulationRate = this.defaultSimulationRate;
        this.heartbeatTimeout = this.defaultHeartbeatTimeout;
        this.electionTimeout = null;
        this.controls = new Controls(this);
        this.nodes = playback.set(Node).model(this);
        this.clients = playback.set(Client).model(this);
        this.messages = playback.set(Message).model(this);
        this.latencies = {};
        this.bbox = tsld.bbox(0, 100, 100, 0);
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
     * Sends a message between two nodes if latency is greater than zero.
     *
     * @return {Message}
     */
    Model.prototype.send = function (source, target, payload, callback) {
        var message,
            source = (typeof(source) == "string" ? source : source.id),
            target = (typeof(target) == "string" ? target : target.id),
            latency = this.latency(source, target);

        if (!(latency > 0)) {
            return null;
        }

        message = this.messages.create();
        message.payload  = (payload !== undefined ? payload : null);
        message.source   = source;
        message.target   = target;
        message.sendTime = this.playhead();
        message.recvTime = message.sendTime + latency;

        if (callback !== undefined && callback !== null) {
            this.frame().after(latency, callback);
        }

        return message;
    };

    /**
     * Zooms in on a given node or zooms out to full screen.
     *
     * @param {Array}
     */
    Model.prototype.zoom = function (nodes) {
        var i, node,
            bbox = null;

        // Passing in a null node clears the zoom.
        if (nodes === null || nodes === undefined || nodes.length === 0) {
            bbox = tsld.bbox(0, 100, 100, 0);
        } else {
            // Find the x and y ranges to constrain the zoom bbox.
            bbox = nodes[0].bbox();
            for (i = 1; i < nodes.length; i += 1) {
                bbox = bbox.union(nodes[i].bbox());
            }
        }

        this.bbox = bbox;
        this.domains.x = [bbox.left, bbox.right];
        this.domains.y = [bbox.top, bbox.bottom];
    };

    /**
     * Removes all data from the model.
     */
    Model.prototype.clear = function () {
        this.title = this.subtitle = "";
        this.nodes.removeAll();
        this.clients.removeAll();
        this.messages.removeAll();
        this.latencies = {};
    };

    /**
     * Retrieves the latency between two node ids.
     */
    Model.prototype.latency = function (a, b, latency) {
        var ret,
            x = (a < b ? a : b),
            y = (a < b ? b : a),
            key = [a, b].join("|");
        if (arguments.length === 2) {
            ret = this.latencies[key];
            return (ret !== undefined ? ret : DEFAULT_NETWORK_LATENCY);
        }
        this.latencies[key] = latency;
        return this;
    };

    /**
     * Retrieves the playhead for the next election.
     */
    Model.prototype.nextElectionAt = function () {
        var playhead = null;
        this.nodes.toArray().forEach(function(node) {
            if (playhead === null || node.electionAt < playhead) {
                playhead = node.electionAt;
            }
        })
        return playhead;
    };

    /**
     * Clones the model.
     */
    Model.prototype.clone = function () {
        var i, key, clone = new Model();
        clone._player = this._player;
        clone.title = this.title;
        clone.subtitle = this.subtitle;
        clone.nodes = this.nodes.clone().model(clone);
        clone.clients = this.clients.clone().model(clone);
        clone.messages = this.messages.clone().model(clone);
        clone.bbox = this.bbox;
        clone.domains = {
            x: this.domains.x,
            y: this.domains.y,
        };
        for(key in this.latencies) {
            clone.latencies[key] = this.latencies[key];
        }
        return clone;
    };

    return Model;
});
