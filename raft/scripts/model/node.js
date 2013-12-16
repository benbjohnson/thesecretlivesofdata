
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback, tsld*/

define([], function () {
    function Node(id) {
        this.id = id;
        this._state = "follower";
        this._value = "";
        this._currentTerm = 0;
        this._votedFor = null;
        this._commitIndex = 0;
        this._lastApplied = 0;
        this._nextIndex = {};
        this._matchIndex = {};
        this._timer = null;
        this._log = [];
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
     * Retrieve the current node value.
     */
    Node.prototype.value = function () {
        return this._value;
    };

    /**
     * Retrieves the log entries.
     */
    Node.prototype.log = function () {
        return this._log;
    };

    /**
     * Retrieve the current commit index.
     */
    Node.prototype.commitIndex = function () {
        return this._commitIndex;
    };

    /**
     * Retrieve the current node timer.
     */
    Node.prototype.timer = function () {
        return this._timer;
    };

    /**
     * Sets or retrieves the current term.
     */
    Node.prototype.currentTerm = function (value) {
        if (arguments.length === 0) {
            return this._currentTerm;
        }
        var changed = (value > this._currentTerm);
        if (changed) {
            this._currentTerm = value;
            this.state("follower");
        }
        return this._value;
    };

    /**
     * Sets or retrieves the node state.
     */
    Node.prototype.state = function (value) {
        if (arguments.length === 0) {
            return this._state;
        }
        if (this._state !== value) {
            this._state = value;

            // Clear the existing state timer.
            this.frame().clearTimer(this.timer);
            this.timer = null;

            // Begin event loop for this node.
            switch (this._state) {
            case "leader":
                this.leaderEventLoop();
                break;
            case "candidate":
                this.candidateEventLoop();
                break;
            case "follower":
                this.followerEventLoop();
                break;
            case "stopped":
                break;
            default:
                throw new Error("Invalid node state: " + this._state);
            }
        }

        return this;
    };


    //----------------------------------
    // Event Loops
    //----------------------------------

    /**
     * Runs the node as a leader:
     *
     *   - Upon election: send initial empty AE RPC to each server,
     *     repeat during idle periods to prevent election timeouts. (§5.2)
     *
     *   - If command received from client: append entry to local log,
     *     respond after entry applied to state machine. (§5.3)
     *
     *   - If last log index ≥ nextIndex for a follower: send AE
     *     RPC with log entries starting at nextIndex.
     *     - If succcessful: update nextIndex and matchIndex for follower (§5.3).
     *     - If AE fails because of log inconsistency: decrement nextIndex
     *       and retry (§5.3).
     *
     *   - If there exists an N such that N > commitIndex, a majority of
     *     matchIndex[i] ≥ N, and log[N].term == currentTerm:
     *     set commitIndex = N (§5.3, §5.4).
     */
    Node.prototype.leaderEventLoop = function () {
        var self = this,
            frame = this.frame();

        // Reset known indices on other servers.
        this._nextIndex = {};
        this._matchIndex = {};

        // Send heartbeats to followers.
        this.timer = frame.timer(function() {
            self.model().nodes.toArray().forEach(function(node) {
                if (node.id !== self.id) {
                    self.sendAppendEntriesRequest(node);
                }
            });
        }).interval(this.model().heartbeatTimeout).delay(this.model().heartbeatTimeout);
    };

    /**
     * Runs the node as a candidate:
     *
     *   - On conversion to candidate, start election:
     *     - Increment currentTerm.
     *     - Vote for self.
     *     - Reset election timeout.
     *     - Send RequestVote RPCs to all other servers.
     *
     *   - If votes received from majority of server: become leader.
     *
     *   - If AppendEntries RPC received from new leader: convert to follower.
     *
     *   - If election timeout elapses, start new election.
     */
    Node.prototype.candidateEventLoop = function () {
        this._currentTerm += 1;
        // TODO: Vote for self.
        // TODO: Reset election timeout
        // TODO: Send RequestVote RPCs to all other servers.
    };

    /**
     * Runs the node as a follower.
     *
     *   - Respond to RPCs from candidates and leaders.
     *
     *   - If election timeout elapses without receiving AE RPC
     *     from current leader or granting vote to candidate:
     *     convert to candidate.
     */
    Node.prototype.followerEventLoop = function () {
        // TODO: Reset election timeout.
    };


    //----------------------------------
    // Append Entries
    //----------------------------------

    Node.prototype.sendAppendEntriesRequest = function (target) {
        var self  = this,
            frame = this.frame(),
            nextIndex = (this._nextIndex[target.id] !== undefined ? this._nextIndex[target.id] : 0),
            prevEntry = this._log[nextIndex-1],
            req   = {
                type: "AEREQ",
                term: this.currentTerm(),
                leaderId: this.id,
                prevLogIndex: (prevEntry !== undefined ? prevEntry.index : 0),
                prevLogTerm: (prevEntry !== undefined ? prevEntry.term : 0),
                log: this._log.slice(nextIndex),
                leaderCommit: this.commitIndex(),
            };

        return this.model().send(this, target, req, function() {
            target.recvAppendEntriesRequest(self, req);
        });
    };

    Node.prototype.recvAppendEntriesRequest = function (source, req) {
        var self  = this,
            frame = this.frame(),
            prevEntry = this._log[req.prevLogIndex],
            success = true;

        this.currentTerm(req.term);

        // Reply false if term < currentTerm (§5.3).
        if (req.term < this.currentTerm()) {
            success = false;
        }
        // Reply false if log doesn't contain an entry at prevLogIndex whose
        // term matchs prevLogTerm (§5.3).
        else if (req.prevLogIndex !== 0 && (prevEntry === undefined || prevEntry.term !== req.prevLogTerm)) {
            success = false;
        }

        if (success) {
            // If an existing entry conflicts with a new one (same index but different terms), delete the existing entry and all that follow it (§5.3).
            // Append any new entries not already in the log.
            if (req.log.length > 0) {
                this._log = this._log.slice(0, req.log[0])
            }

            // If leaderCommit > commitIndex, set commitIndex = min(leaderCommit, last log index).
            this.commitIndex(req.leaderCommit);
        }

        // Send response.
        var resp = {
            type:"AERSP",
            term: this.currentTerm(),
            success: success,
        };
        resp.nextIndex = (this._log.length > 0 ? this._log[this._log.length-1].index : 0);
        return this.model().send(this, source, resp, function() {
            source.recvAppendEntriesResponse(self, req, resp);
        });
    };

    Node.prototype.recvAppendEntriesResponse = function (source, req, resp) {
        this.currentTerm(resp.term);
        if (resp.success) {
            this._nextIndex[source.id] = resp.nextIndex;
        }
    };


    //----------------------------------
    // Utility
    //----------------------------------

    /**
     * Clones the node.
     */
    Node.prototype.clone = function () {
        var i, clone = new Node();
        clone.id = this.id;
        clone._state = this._state;
        clone._log = this._log.map(function (entry) { return entry.clone(); });
        return clone;
    };

    return Node;
});
