
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
            frame.model().title = '<h2 style="visibility:visible">Read Replicas</h1>'
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
            model().nodes.create("D");
            model().nodes.create("E");
            cluster(["A", "B", "C"]);
            layout.invalidate();
        })


        //------------------------------
        // Overview
        //------------------------------
        .then(function () {
            subtitle('<h2>Once we have a leader elected we need to replicate all changes to our system to all nodes.</h2>', false);
        })
        .then(wait).indefinite()
 
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
