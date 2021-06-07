
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback, tsld*/

define(["./log_entry"], function (LogEntry) {
    function Node(model, id) {
        playback.DataObject.call(this, model);
        this.id = id;
        this._state = "follower";
        this._cluster = [this];
        this._value = "";
        this._address = id.toString()+'.domain.com'
        this._leaderId = null;
        this._votedFor = null;
        this._voteCount = null;
        this._commitIndex = 0;
        this._lastApplied = 0;
        this._nextIndex = {};
        this._matchIndex = {};
        this._timer = null;
        this._electionTimeout = 0;
        this._log = [];
        this._heartbeatTimer = null;
        this._electionTimer = null;
        this._type = "";

        this.addEventListener("stateChange", this.onStateChange);
        this.addEventListener("logChange", this.onLogChange);
    }

    Node.prototype = new playback.DataObject();
    Node.prototype.constructor = Node;

    /**
     * Initializes the node to a follower.
     */
    Node.prototype.init = function () {
        this.state("follower");
        return this;
    };


    Node.prototype.type = function (value) {
        if (arguments.length === 0) {
            return this._type;
        }
        this._type = value;
        return this;
    };
    /**
     * Sets or retrieves the model.
     */
    Node.prototype.model = function (value) {
        if (arguments.length === 0) {
            return this._model;
        }
        this._model = value;
        this._log.forEach(function(entry) { entry.model(value) });
        return this;
    };

    /**
     * Determines the bounding box of the node and its log.
     */
    Node.prototype.bbox = function () {
        var bbox = tsld.bbox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
        bbox = bbox.union(this.logbbox());
        return bbox;
    };

    Node.prototype.logbbox = function () {
        var i, bbox;
        if (this._log.length === 0) {
            return null;
        }
        bbox = this._log[0].bbox();
        for (i = 1; i < this._log.length; i += 1) {
            bbox = this._log[i].bbox();
        }
        return bbox;
    };


    /**
     * Sets or retrieves the list of nodes in the cluster.
     */
    Node.prototype.cluster = function (value) {
        var cluster = value;
        if (arguments.length === 0) {
            return this._cluster;
        }

        // Make sure this node is in the cluster.
        if (cluster.indexOf(this.id) === -1) {
            cluster = cluster.concat([this.id]);
        }

        this._cluster = cluster;
        return this;
    };

    /**
     * Retrieve the current node value.
     */
    Node.prototype.value = function () {
        return this._value;
    };

    Node.prototype.address = function () {
        return this._address;
    };


    /**
     * Retrieve the current known leader identifier.
     */
    Node.prototype.leaderId = function () {
        return this._leaderId;
    };

    /**
     * Retrieves the log entries.
     */
    Node.prototype.log = function () {
        return this._log;
    };

    /**
     * Retrieve the current node timer.
     */
    Node.prototype.timer = function () {
        return this._timer;
    };



    /**
     * Sets or retrieves the node state.
     */
    Node.prototype.state = function (value) {
        var prevValue = this._state;
        if (arguments.length === 0) {
            return this._state;
        }
        this._state = value;


        this.dispatchChangeEvent("stateChange", value, prevValue);

        return this;
    };

    /**
     * Executes a given command.
     */
    Node.prototype.execute = function (command, callback) {
        var entry,
            prevIndex = (this._log.length > 0 ? this._log[this._log.length-1].index : 0);
        if (this.state() !== "leader") {
            return false;
        }

        // Append to log.
        this.dispatchChangeEvent("logChange");
    };


    //----------------------------------
    // Event Handlers
    //----------------------------------

    Node.prototype.onStateChange = function (event) {
        event.target.layout().invalidate();
    };


    Node.prototype.onLogChange = function (event) {
        event.target.layout().invalidate();
    };


    //----------------------------------
    // Utility
    //----------------------------------

    /**
     * Dispatches the event from the node and from the model.
     */
    Node.prototype.dispatchEvent = function (event) {
        playback.DataObject.prototype.dispatchEvent.call(this, event);
        this.model().dispatchEvent(event);
    };

    /**
     * Clones the node.
     */
    Node.prototype.clone = function (model) {
        var clone = new Node(model, this.id);
        clone._state = this._state;
        clone._type = this._type;
        clone._address = this._address;
        clone._log = this._log.map(function (entry) { return entry.clone(model); });
        return clone;
    };

    return Node;
});
