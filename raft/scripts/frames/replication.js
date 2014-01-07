
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
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; },
            clear = function() { subtitle('', false); },
            removeAllNodes = function() { model().nodes.toArray().forEach(function(node) { node.state("stopped"); }); model().nodes.removeAll(); };

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
            layout.invalidate();
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
            subtitle('<h2>First a client sends a change to the leader.</h2>', false);
        })
        .then(wait).indefinite()
        .then(function () {
            client("X").send(model().leader(), "SET 5");
        })
        .after(model().defaultNetworkLatency, function() {
            subtitle('<h2>The change is appended to the leader\'s log...</h2>');
        })
        .at(model(), "appendEntriesRequestsSent", function () {})
        .after(model().defaultNetworkLatency * 0.25, function(event) {
            subtitle('<h2>...then the change is sent to the followers on the next heartbeat.</h2>');
        })
        .after(1, clear)
        .at(model(), "commitIndexChange", function (event) {
            if(event.target === model().leader()) {
                subtitle('<h2>An entry is committed once a majority of followers acknowledge it...</h2>');
            }
        })
        .after(model().defaultNetworkLatency * 0.25, function(event) {
            subtitle('<h2>...and a response is sent to the client.</h2>');
        })
        .after(1, clear)
        .after(model().defaultNetworkLatency, function(event) {
            subtitle('<h2>Now let\'s send a command to increment the value by "2".</h2>');
            client("X").send(model().leader(), "ADD 2");
        })
        .after(1, clear)
        .at(model(), "recv", function (event) {
            subtitle('<h2>Our system value is now updated to "7".</h2>', false);
        })
        .after(1, wait).indefinite()


        //------------------------------
        // Network Partition
        //------------------------------
        .after(1, function () {
            removeAllNodes();
            model().nodes.create("A");
            model().nodes.create("B");
            model().nodes.create("C");
            model().nodes.create("D");
            model().nodes.create("E");
            layout.invalidate();
        })
        .after(500, function () {
            node("A").init();
            node("B").init();
            node("C").init();
            node("D").init();
            node("E").init();
            cluster(["A", "B", "C", "D", "E"]);
            model().resetToNextTerm();
            node("B").state("leader");
        })
        .after(1, function () {
            subtitle('<h2>Raft can even stay consistent in the face of network partitions.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>Let\'s add a partition to separate A & B from C, D & E.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            model().latency("A", "C", 0).latency("A", "D", 0).latency("A", "E", 0);
            model().latency("B", "C", 0).latency("B", "D", 0).latency("B", "E", 0);
            model().ensureExactCandidate("C");
        })
        .after(model().defaultNetworkLatency * 0.5, function () {
            var p = model().partitions.create("-");
            p.x1 = Math.min.apply(null, model().nodes.toArray().map(function(node) { return node.x;}));
            p.x2 = Math.max.apply(null, model().nodes.toArray().map(function(node) { return node.x;}));
            p.y1 = p.y2 = Math.round(node("B").y + node("C").y) / 2;
            layout.invalidate();
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>Because of our partition we now have two leaders in different terms.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            model().clients.create("Y");
            subtitle('<h2>Let\'s add another client and try to update both leaders.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            client("Y").send(node("B"), "SET 3");
            subtitle('<h2>One client will try to set the value of node B to "3".</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>Node B cannot replicate to a majority so its log entry stays uncommitted.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            var leader = model().leader(["C", "D", "E"]);
            client("X").send(leader, "SET 8");
            subtitle('<h2>The other client will try to set the value of node ' + leader.id + ' to "8".</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>This will succeed because it can replicate to a majority.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>Now let\'s heal the network partition.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            model().partitions.removeAll();
            layout.invalidate();
        })
        .after(200, function () {
            model().resetLatencies();
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.id === "B" && event.target.state() === "follower");
        })
        .after(1, function () {
            subtitle('<h2>Node B will see the higher election term and step down.</h2>');
        })
        .after(1, function () {
            subtitle('<h2>Both nodes A & B will roll back their uncommitted entries and match the new leader\'s log.</h2>');
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>Our log is now consistent across our cluster.</h2>', false);
        })
        .after(1, wait).indefinite()

        .then(function() {
            player.next();
        })

        player.play();
    };
});
