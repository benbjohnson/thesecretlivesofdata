
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3, playback*/

define(["./log", "./bbox"], function (Log, BBox) {
    function Node(id) {
        this.id = id;
        this.state = "follower";
        this.value = "";
        this.timerId = 0;
        this.electionAt = null;
        this.electionTimeout = null;
        this.log = new Log();
    }

    Node.prototype = playback.dataObject();
    Node.prototype.constructor = Node;

    /**
     * Sets or retrieves the model.
     */
    Node.prototype.model = function (value) {
        if (arguments.length === 0) {
            return this._model;
        }
        this._model = value;
        this.log.model(value);
        return this;
    };

    /**
     * Determines the bounding box of the node and its log.
     */
    Node.prototype.bbox = function () {
        var bbox = new BBox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
        bbox = bbox.union(this.log.bbox());
        return bbox;
    };

    /**
     * Runs a simulation.
     */
    Node.prototype.simulate = function () {
        this.frame().clearTimer(this.timerId);
        this.timerId = 0;

        switch (this.state) {
        case "leader":
            this.simulateLeader();
            break;
        case "candidate":
            this.simulateCandidate();
            break;
        case "follower":
            this.simulateFollower();
            break;
        case "stopped":
            break;
        default:
            throw new Error("Invalid node state: " + this.state);
        }
    };

    Node.prototype.simulateLeader = function () {
        var self = this,
            frame = this.frame();

        // Send heartbeats to followers.
        this.timerId = frame.timer(function() {
            self.model().nodes.toArray().forEach(function(node) {
                if (node.id !== this.id) {
                    self.sendAppendEntriesRequest(node);
                }
            });
        }).interval(this.model().heartbeatTimeout).delay(this.model().heartbeatTimeout).id();
    };

    Node.prototype.simulateCandidate = function () {
    };

    Node.prototype.simulateFollower = function () {
    };


    Node.prototype.sendAppendEntriesRequest = function (node) {
        var self  = this,
            frame = this.frame(),
            term         = this.log.term,
            leaderId     = this.id,
            prevLogIndex = 0,
            prevLogTerm  = 0,
            entries      = this.log.entries.slice(),
            leaderCommit = this.log.commitIndex;

        this.model().send(this, node, latency, function() {
            node.recvAppendEntries(term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit);
        });
    };

    Node.prototype.recvAppendEntriesRequest = function (term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit) {
        var self  = this,
            frame = this.frame();

        // Reset the next election for this node.
        this.electionTimeout = (this.model().electionTimeout * (1 + Math.random()));
        this.electionAt = frame.playhead() + this.electionTimeout;
    };

    /**
     * Clones the node.
     */
    Node.prototype.clone = function () {
        var i, clone = new Node();
        clone.id = this.id;
        clone.state = this.state;
        clone.timerId = this.timerId;
        clone.log = this.log.clone();
        return clone;
    };

    return Node;
});
