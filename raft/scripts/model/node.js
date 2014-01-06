
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
        this._currentTerm = 0;
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

        this.addEventListener("stateChange", this.onStateChange);
        this.addEventListener("leaderIdChange", this.onLeaderIdChange);
        this.addEventListener("votedForChange", this.onVotedForChange);
        this.addEventListener("voteCountChange", this.onVoteCountChange);
        this.addEventListener("currentTermChange", this.onCurrentTermChange);
        this.addEventListener("commitIndexChange", this.onCommitIndexChange);
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

    /**
     * Retrieve who the node voted for in this term.
     */
    Node.prototype.votedFor = function () {
        return this._votedFor;
    };

    /**
     * Retrieve the number of votes received for this term.
     */
    Node.prototype.voteCount = function () {
        return this._voteCount;
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
     * Sets or retrieve the current commit index.
     */
    Node.prototype.commitIndex = function (value) {
        var i, prevValue = this._commitIndex;
        if (arguments.length === 0) {
            return this._commitIndex;
        }

        // Apply new committed entries.
        if (value > this._commitIndex) {
            for (i = this._commitIndex; i < value; i += 1) {
                this._log[i].applyTo(this);
            }
            this._commitIndex = value;
            this.dispatchChangeEvent("commitIndexChange", value, prevValue);
            this.dispatchChangeEvent("logChange");
        }

        return this;
    };

    /**
     * Sets or retrieves the next index for a node.
     */
    Node.prototype.nextIndex = function (id, value) {
        if (arguments.length === 1) {
            if (this._nextIndex[id] === undefined) {
                return 1;
            }
            return this._nextIndex[id];
        }

        this._nextIndex[id] = value;

        return this;
    };

    /**
     * Sets or retrieves the match index for a node.
     * Updates the commitIndex if a quorum is committed.
     */
    Node.prototype.matchIndex = function (id, value) {
        var i, key, newCommitIndex,
            indices = {},
            quorumSize = Math.ceil((this._cluster.length + 1) / 2);

        if (arguments.length === 0) {
            throw new Error("At least 1 argument required");
        }

        if (arguments.length === 1) {
            if (this._matchIndex[id] === undefined) {
                return 0;
            }
            return this._matchIndex[id];
        }

        // Only update if this node is the leader.
        if (this.state() === "leader") {
            this._matchIndex[id] = value;

            // Update commit index.
            if (this._log.length > 0) {
                // Update this server's index.
                this._matchIndex[this.id] = this._log[this._log.length-1].index;

                // Set index commit counts.
                for (key in this._matchIndex) {
                    for (i = this.commitIndex() + 1; i <= this._matchIndex[key]; i += 1) {
                        indices[i] = (indices[i] !== undefined ? indices[i] : 0) + 1;
                    }
                }

                // Find the highest replicated index with a quorum.
                newCommitIndex = this.commitIndex();
                for (key in indices) {
                    if (indices[key] >= quorumSize) {
                        newCommitIndex = Math.max(newCommitIndex, key);
                    }
                }
                this.commitIndex(newCommitIndex);
            }
        }

        return this;
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
        var changed = (value > this._currentTerm),
            prevValue = this._currentTerm;
        if (changed) {
            this._currentTerm = value;
            this._votedFor = null;
            this._leaderId = null;
            this._voteCount = 0;
            this.state("follower");
            this.dispatchChangeEvent("votedForChange");
            this.dispatchChangeEvent("voteCountChange");
            this.dispatchChangeEvent("currentTermChange", value, prevValue);
        }
        return this._value;
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
            this.clearHeartbeatTimer();
            this.clearElectionTimer();
            break;
        default:
            throw new Error("Invalid node state: " + this._state);
        }

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
        this._log.push(new LogEntry(this.model(), prevIndex + 1, this.currentTerm(), command, callback));
        this.dispatchChangeEvent("logChange");
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

        this.clearElectionTimer();
        this.resetHeartbeatTimer();
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
        // Increment current term.
        this._currentTerm += 1;

        // Vote for self.
        this._votedFor = this.id;
        this._voteCount = 1;
        this._leaderId = null;
        this.dispatchChangeEvent("leaderIdChange");
        this.dispatchChangeEvent("votedForChange");
        this.dispatchChangeEvent("voteCountChange");

        // Reset timers.
        this.clearHeartbeatTimer();
        this.resetElectionTimer();

        // Send RequestVote RPCs to all other servers.
        this.sendRequestVoteRequests();
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
        this.clearHeartbeatTimer();
        this.resetElectionTimer();
    };


    //----------------------------------
    // Heartbeat Timer
    //----------------------------------

    /**
     * Retrieves the current heartbeat timer.
     */
    Node.prototype.heartbeatTimer = function () {
        return this._heartbeatTimer;
    };

    /**
     * Starts a new timer to that will send out heartbeats.
     */
    Node.prototype.resetHeartbeatTimer = function () {
        var self = this,
            timeout = this.model().heartbeatTimeout;

        if (this._heartbeatTimer === null) {
            this.clearHeartbeatTimer();
            this._heartbeatTimer = this.frame().timer(function() {
                self.sendAppendEntriesRequests();
            }).interval(timeout);
        }
    };

    /**
     * Clears the heartbeat timer.
     */
    Node.prototype.clearHeartbeatTimer = function () {
        this.frame().clearTimer(this.heartbeatTimer());
        this._heartbeatTimer = null;
    };


    //----------------------------------
    // Election Timer
    //----------------------------------

    /**
     * Retrieves the current election timer.
     */
    Node.prototype.electionTimer = function () {
        return this._electionTimer;
    };

    /**
     * Retrieves the current election timeout value.
     */
    Node.prototype.electionTimeout = function () {
        return this._electionTimeout;
    };

    /**
     * Starts a new timer to that will kick off an election.
     */
    Node.prototype.resetElectionTimer = function () {
        var self = this,
            electionTimeout = this.model().electionTimeout,
            timeout = Math.round(electionTimeout * (1 + Math.random()));

        this.clearElectionTimer();
        this._electionTimeout = timeout;
        this._electionTimer = this.frame().after(timeout, function() {
            self.state("candidate");
        });
    };

    /**
     * Clears the election timer.
     */
    Node.prototype.clearElectionTimer = function () {
        this.frame().clearTimer(this.electionTimer());
        this._electionTimer = null;
        this._electionTimeout = 0;
    };


    //----------------------------------
    // Request Vote
    //----------------------------------

    Node.prototype.sendRequestVoteRequests = function () {
        var self = this;
        this.cluster().forEach(function(id) {
            var target = self.model().nodes.find(id);
            if (target !== null && target.id !== self.id) {
                self.sendRequestVoteRequest(target);
            }
        });
        this.dispatchChangeEvent("requestVoteRequestsSent");
    };

    Node.prototype.sendRequestVoteRequest = function (target) {
        var self  = this,
            frame = this.frame(),
            prevEntry = this._log[this._log.length-1],
            req   = {
                type: "RVREQ",
                term: this.currentTerm(),
                candidateId: this.id,
                lastLogIndex: (prevEntry !== undefined ? prevEntry.index : 0),
                lastLogTerm: (prevEntry !== undefined ? prevEntry.term : 0),
            };

        this.dispatchChangeEvent("requestVoteRequestSent", req);

        return this.model().send(this, target, req, function() {
            target.recvRequestVoteRequest(self, req);
        });
    };

    /**
     * Receiver Implementation:
     *
     *   - Reply false if term < currentTerm (§5.1).
     *
     *   - If votedFor is null or candidateId, and candidate's log is at
     *     least as up-to-date as receiver's log, grant vote (§5.2, §5.4).
     */
    Node.prototype.recvRequestVoteRequest = function (source, req) {
        var self  = this,
            frame = this.frame(),
            prevLogEntry = this._log[this._log.length-1],
            prevLogIndex = (prevLogEntry !== undefined ? prevLogEntry.index : 0),
            prevLogTerm  = (prevLogEntry !== undefined ? prevLogEntry.term : 0),
            voteGranted = true;

        if (this.state() === "stopped") {
            return;
        }

        this.currentTerm(req.term);

        // Reply false if term < currentTerm (§5.1).
        if (req.term < this.currentTerm()) {
            voteGranted = false;
        }
        // Reply false if already voted for another candidate.
        else if (this._votedFor !== null && this._votedFor !== req.candidateId) {
            voteGranted = false;
        }
        // Reply false if candidate's log is not at least as up-to-date as receiver's log.
        else if (req.lastLogTerm < prevLogTerm || (req.lastLogTerm === prevLogTerm && req.lastLogIndex < prevLogIndex)) {
            voteGranted = false;
        }

        if (voteGranted) {
            // Vote for candidate.
            this._votedFor = req.candidateId;
            this.dispatchChangeEvent("votedForChange");

            // Reset election timeout.
            this.resetElectionTimer();
        }

        // Send response.
        var resp = {
            type:"RVRSP",
            term: this.currentTerm(),
            voteGranted: voteGranted,
        };

        this.dispatchChangeEvent("requestVoteRequestReceived", req);
        this.dispatchChangeEvent("requestVoteResponseSent", resp);

        return this.model().send(this, source, resp, function() {
            source.recvRequestVoteResponse(self, req, resp);
        });
    };

    Node.prototype.recvRequestVoteResponse = function (source, req, resp) {
        var quorumSize = Math.ceil((this._cluster.length + 1) / 2);

        if (this.state() !== "candidate") {
            return;
        }

        this.currentTerm(resp.term);

        if (resp.voteGranted && this.state() === "candidate") {
            this._voteCount += 1;

            // Promote to leader.
            if (this._voteCount >= quorumSize) {
                this.state("leader");
            }
            this.dispatchChangeEvent("voteCountChange");
        }

        this.dispatchChangeEvent("requestVoteResponseReceived", resp);
    };


    //----------------------------------
    // Append Entries
    //----------------------------------

    Node.prototype.sendAppendEntriesRequests = function () {
        var self = this;
        this.cluster().forEach(function(id) {
            var target = self.model().nodes.find(id);
            if (target !== null && target.id !== self.id) {
                self.sendAppendEntriesRequest(target);
            }
        });
        this.dispatchChangeEvent("appendEntriesRequestsSent");
    };

    Node.prototype.sendAppendEntriesRequest = function (target) {
        var self  = this,
            frame = this.frame(),
            nextIndex = (this._nextIndex[target.id] !== undefined ? this._nextIndex[target.id] : 1),
            prevEntry = this._log[nextIndex-2],
            req   = {
                type: "AEREQ",
                term: this.currentTerm(),
                leaderId: this.id,
                prevLogIndex: (prevEntry !== undefined ? prevEntry.index : 0),
                prevLogTerm: (prevEntry !== undefined ? prevEntry.term : 0),
                log: this._log.slice(nextIndex - 1).map(function (entry) { var clone = entry.clone(); clone.callback = null; return clone; }),
                leaderCommit: this.commitIndex(),
            };
        this.dispatchChangeEvent("appendEntriesRequestSent", req);

        return this.model().send(this, target, req, function() {
            target.recvAppendEntriesRequest(self, req);
        });
    };

    Node.prototype.recvAppendEntriesRequest = function (source, req) {
        var self  = this,
            frame = this.frame(),
            prevEntry = this._log[req.prevLogIndex-1],
            success = true;

        if (this.state() === "stopped") {
            return;
        }

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
            // Update leader.
            this._leaderId = req.leaderId;
            this.dispatchChangeEvent("leaderIdChange");

            // Step down if candidate.
            if (this.state() === "candidate") {
                this.state("follower");
            }

            // If an existing entry conflicts with a new one (same index but different terms), delete the existing entry and all that follow it (§5.3).
            // Append any new entries not already in the log.
            if (req.log.length > 0) {
                this._log = this._log.slice(0, req.log[0].index-1);
            }

            // Append log entries.
            this._log = this._log.concat(req.log);

            // If leaderCommit > commitIndex, set commitIndex = min(leaderCommit, last log index).
            this.commitIndex(req.leaderCommit);

            // Reset election timeout.
            this.resetElectionTimer();

            this.dispatchChangeEvent("logChange");
        }

        // Send response.
        var resp = {
            type:"AERSP",
            term: this.currentTerm(),
            success: success,
        };
        resp.nextIndex = (this._log.length > 0 ? this._log[this._log.length-1].index : 0);

        this.dispatchChangeEvent("appendEntriesRequestReceived", req);
        this.dispatchChangeEvent("appendEntriesResponseSent", resp);

        return this.model().send(this, source, resp, function() {
            source.recvAppendEntriesResponse(self, req, resp);
        });
    };

    Node.prototype.recvAppendEntriesResponse = function (source, req, resp) {
        if (this.state() !== "leader") {
            return;
        }

        this.currentTerm(resp.term);

        if (resp.success && req.log.length > 0) {
            this.nextIndex(source.id, req.log[req.log.length-1].index + 1);
            this.matchIndex(source.id, req.log[req.log.length-1].index);
        }

        this.dispatchChangeEvent("appendEntriesResponseReceived", resp);
    };


    //----------------------------------
    // Event Handlers
    //----------------------------------

    Node.prototype.onStateChange = function (event) {
        event.target.layout().invalidate();
    };

    Node.prototype.onLeaderIdChange = function (event) {
        event.target.layout().invalidate();
    };

    Node.prototype.onVotedForChange = function (event) {
        event.target.layout().invalidate();
    };

    Node.prototype.onVoteCountChange = function (event) {
        event.target.layout().invalidate();
    };

    Node.prototype.onCurrentTermChange = function (event) {
        event.target.layout().invalidate();
    };

    Node.prototype.onCommitIndexChange = function (event) {
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
        clone._log = this._log.map(function (entry) { return entry.clone(model); });
        return clone;
    };

    return Node;
});
