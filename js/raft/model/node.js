
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3*/

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
    Node.prototype.simulate = function (model) {
        switch (this.state) {
        case "leader":
            this.simulateLeader(model);
            break;
        case "candidate":
            this.simulateCandidate(model);
            break;
        case "follower":
            this.simulateFollower(model);
            break;
        default:
            throw new Error("Invalid node state: " + this.state);
        }
    };

    Node.prototype.simulateLeader = function (model) {
        var self = this,
            frame = model.frame();
        // Send heartbeats to followers.
        var timer = frame.timer(function() {
            var i, node, nodes = model.nodes.toArray();
            for (i = 0; i < nodes.length; i += 1) {
                self.sendHeartbeatTo(model, nodes[i]);
            }
        }).interval(model.heartbeatTimeout).delay(model.heartbeatTimeout);
        this.timerId = timer.id();
    };

    Node.prototype.sendHeartbeatTo = function (model, node) {
        var frame = model.frame();

        if (node.id !== this.id) {
            var latency = model.latency(this.id, node.id);
            model.send(this, node, latency);
            frame.after(latency, function() {
                node.electionTimeout = (model.electionTimeout * (1 + Math.random()));
                node.electionAt = frame.playhead() + node.electionTimeout;
            });
        }
    };

    Node.prototype.simulateCandidate = function (model) {
    };

    Node.prototype.simulateFollower = function (model) {
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
