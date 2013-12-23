
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
            wait = function() { var self = this; model().controls.show(function() { self.stop(); }); },
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; };

        frame.after(1, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">Leader Election</h1>'
                                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        .after(300, function () {
            model().nodes.create("a").init();
            model().nodes.create("b").init();
            model().nodes.create("c").init();
            node("a").cluster(["a", "b", "c"]);
            node("b").cluster(["a", "b", "c"]);
            node("c").cluster(["a", "b", "c"]);
            model().ensureSingleCandidate();
            model().subtitle = '<h2>In Raft there are two timeout settings which control elections.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(model().electionTimeout / 2, function() { model().controls.show(); })
        .after(100, function () {
            subtitle('<h2>First is the <span style="color:green">election timeout</span>.</h2>');
        })
        .after(1, function() {
            subtitle('<h2>The election timeout is the amount of time a follower waits until becoming a candidate.</h2>');
        })
        .after(1, function() {
            subtitle('<h2>The election timeout is a random number between 150ms and 300ms.</h2>');
        })
        .after(1, function() {
            subtitle("", false);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(1, function () {
            subtitle('<h2>Once a follower becomes a candidate it starts a new <em>election term</em>...</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>...and sends out <em>Request Vote</em> requests to other nodes.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>If the receiving node hasn\'t voted yet in this term then it votes for the candidate...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...and the node resets its election timeout.</h2>');
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>Once a candidate has a majority of votes it becomes leader.</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>The leader begins sending out <em>Append Entries</em> requests to its followers.</h2>');
        })
        .after(1, function () {
            subtitle('<h2>These requests are sent in intervals specified by the <span style="color:red">heartbeat timeout</span>.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>Followers respond to the <em>Append Entries</em> requests .</h2>');
        })


        player.play();
    };
});
