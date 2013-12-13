
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
            wait = function() { var self = this; model().controls.show(function() { self.stop(); }); };

        /*
        frame.after(1, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">Leader Election</h1>'
                                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })

        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })
        */
        frame.after(300, function () {
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            model().subtitle = '<h2>In Raft there are two timeout settings which control elections.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            node("b").state("leader");
            model().subtitle = '<h2>The <span style="color:green">heartbeat timeout</span> is the interval at which a leader sends heartbeats to followers.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(100, function () {
            model().subtitle = '<h2>The heartbeat timeout is typically between 0.5ms and 20ms.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(300, function () {
            model().electionTimeout = model().defaultElectionTimeout;
            model().subtitle = '<h2>The <span style="color:green">election timeout</span> is the amount of time a follower will wait before starting an election.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(300, function () {
            model().subtitle = '<h2>This election timeout is reset whenever a follower receives a heartbeat.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(100, function () {
            model().subtitle = '<h2>The election timeout is typically between 10ms and 500ms.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(100, function () {
            node("b").state("stopped");
            node("b").simulate();
            model().subtitle = '<h2>If a follower hears no heartbeats within an election timeout then it will become a <strong>candidate</strong>.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(model().heartbeatTimeout + 100, function () {
            var electionAt = model().nextElectionAt();
            this.after(electionAt - frame.playhead(), function () {
                model().subtitle = '<h2>When a node becomes a candidate it will request votes from other nodes.</h2>'
                               + model().controls.html();
                model().controls.show();
            });
        })
        .after(model().electionTimeout * 2, function () {

        })

        player.play();
    };
});
