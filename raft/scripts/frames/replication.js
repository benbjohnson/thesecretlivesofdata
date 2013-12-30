
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            cluster = function(value) { model().nodes.toArray().forEach(function(node) { node.cluster(value); }); },
            wait = function() { var self = this; model().controls.show(function() { self.stop(); }); },
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; };

        //------------------------------
        // Title
        //------------------------------
        frame.after(0, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">Log Replication</h1>'
                                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        //------------------------------
        // Cluster Initialization
        //------------------------------
        .after(300, function () {
            model().nodes.create("A");
            model().nodes.create("B");
            model().nodes.create("C");
            cluster(["A", "B", "C"]);
        })
        .after(500, function () {
            model().forceImmediateLeader();
        })


        //------------------------------
        // Overview
        //------------------------------
        .then(function () {
            subtitle('<h2>Once we have a leader elected we need to replicate all changes to our system to all nodes.</h2>', false);
        })
        .then(wait).indefinite()
        .then(function () {
            subtitle('<h2>This is done by using the same <em>Append Entries</em> message that was used for heartbeats.</h2>', false);
        })
        .then(wait).indefinite()
        .then(function () {
            subtitle('<h2>Let\'s walk through the process.</h2>', false);
        })
        .then(wait).indefinite()


        //------------------------------
        // Single Entry Replication
        //------------------------------
        .then(function () {
            model().clients.create("X");
            subtitle('<h2>When a client sends a change to the leader the change is added as an entry to the log.</h2>', false);
        })
        .then(wait).indefinite()
        .then(function () {
            client("X").send(model().leader(), "SET 5");
        })
        .then(wait).indefinite()


        //------------------------------
        // Candidacy
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(1, function () {
            subtitle('<h2>After the election timeout the follower becomes a candidate and starts a new <em>election term</em>...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...votes for itself...</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>...and sends out <em>Request Vote</em> messages to other nodes.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>If the receiving node hasn\'t voted yet in this term then it votes for the candidate...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...and the node resets its election timeout.</h2>');
        })


        //------------------------------
        // Leadership & heartbeat timeout.
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>Once a candidate has a majority of votes it becomes leader.</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>The leader begins sending out <em>Append Entries</em> messages to its followers.</h2>');
        })
        .after(1, function () {
            subtitle('<h2>These messages are sent in intervals specified by the <span style="color:red">heartbeat timeout</span>.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>Followers then respond to each <em>Append Entries</em> message.</h2>');
        })
        .after(1, function () {
            subtitle('', false);
        })
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>This election term will continue until a follower stops receiving heartbeats and becomes a candidate.</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
        })

        //------------------------------
        // Leader re-election
        //------------------------------
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>Let\'s stop the leader and watch a re-election happen.</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().leader().state("stopped")
        })
        .after(model().defaultNetworkLatency, function () {
            model().ensureSingleCandidate()
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>Node ' + model().leader().id + ' is now leader of term ' + model().leader().currentTerm() + '.</h2>', false);
        })
        .after(1, wait).indefinite()

        //------------------------------
        // Split Vote
        //------------------------------
        .after(1, function () {
            subtitle('<h2>Requiring a marjority of votes guarantees that only one leader can be elected per term.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>If two nodes become candidates at the same time then a split vote can occur.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>Let\'s take a look at a split vote example...</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().nodes.create("D").init().currentTerm(node("A").currentTerm());
            cluster(["A", "B", "C", "D"]);

            // Make sure two nodes become candidates at the same time.
            model().resetToNextTerm();
            var nodes = model().ensureSplitVote();

            // Increase latency to some nodes to ensure obvious split.
            model().latency(nodes[0].id, nodes[2].id, model().defaultNetworkLatency * 1.25);
            model().latency(nodes[1].id, nodes[3].id, model().defaultNetworkLatency * 1.25);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>Two nodes both start an election for the same term...</h2>');
        })
        .after(model().defaultNetworkLatency * 0.75, function () {
            subtitle('<h2>...and each reaches a single follower node before the other.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>Now each candidate has 2 votes and can receive no more for this term.</h2>');
        })
        .after(1, function () {
            subtitle('<h2>The nodes will wait for a new election and try again.</h2>', false);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            model().resetLatencies();
            subtitle('<h2>Node ' + model().leader().id + ' received a majority of votes in term ' + model().leader().currentTerm() + ' so it becomes leader.</h2>', false);
        })
        .after(1, wait).indefinite()


        player.play();
    };
});
