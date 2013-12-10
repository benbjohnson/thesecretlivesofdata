
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); };

        frame.after(1, function() {
            model().clear();
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            layout.invalidate();
        })

        .after(800, function () {
            model().subtitle = '<h2><em>Raft</em> is a protocol for implementing distributed consensus.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>Let\'s look at a high level overview of how it works.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })


        .after(300, function () {
            frame.snapshot();
            model().zoom([node("b")]);
            model().subtitle = '<h2>A node can be in 1 of 3 states:</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            node("b").state = "follower";
            model().subtitle = '<h2>The <em>Follower</em> state,</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            node("b").state = "candidate";
            model().subtitle = '<h2>the <em>Candidate</em> state,</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            node("b").state = "leader";
            model().subtitle = '<h2>or the <em>Leader</em> state.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })


        .after(300, function () {
            frame.snapshot();
            model().zoom(null);
            node("b").state = "follower";
            model().subtitle = '<h2>All our nodes start in the follower state.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>If followers don\'t hear from a leader then they can become a candidate.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            node("a").state = "candidate";
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>The candidate then requests votes from other nodes.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(300, function () {
            model().send(node("a"), node("b"), 1000)
            model().send(node("a"), node("c"), 1000)
            layout.invalidate();
        })
        .after(1000, function () { model().controls.show(); })
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>Nodes will reply with their vote.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(300, function () {
            model().send(node("b"), node("a"), 1000)
            model().send(node("c"), node("a"), 1000)
            layout.invalidate();
        })
        .after(1000, function () {
            node("a").state = "leader";
            layout.invalidate();
            model().controls.show();
        })
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>The candidate becomes the leader if it gets votes from a majority of nodes.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>This process is called <em>Leader Election</em>.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })


        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>All changes to the system now go through the leader.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().subtitle += " ";
            model().clients.create("x");
            layout.invalidate();
        })
        .after(1000, function () {
            client("x").value = "5";
            layout.invalidate();
        })
        .after(500, function () {
            model().send(client("x"), node("a"), 1000);
            layout.invalidate();
        })
        .after(1000, function () {
            node("a").log.append(1, 1, "SET 5");
            layout.invalidate();
            model().controls.show();
        })
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>Each change is added as an entry in the node\'s log.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>This log entry is currently uncommitted so it won\'t update the node\'s value.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), 1000)
            model().send(node("a"), node("c"), 1000)
            model().subtitle = '<h2>To commit the entry the node first replicates it to the follower nodes...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            node("b").log.append(1, 1, "SET 5");
            node("c").log.append(1, 1, "SET 5");
            layout.invalidate();
            model().controls.show();
        })
        .after(100, function () {
            frame.snapshot();
            model().send(node("b"), node("a"), 1000)
            model().send(node("c"), node("a"), 1000)
            model().subtitle = '<h2>then the leader waits until a majority of nodes have written the entry.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            node("a").log.commitIndex = 1;
            node("a").value = "5";
            layout.invalidate();
            model().controls.show();
        })
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>The entry is now committed on the leader node and the node state is "5".</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })
        .after(300, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), 1000)
            model().send(node("a"), node("c"), 1000)
            model().subtitle = '<h2>The leader then notifies the followers that the entry is committed.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            frame.snapshot();
            node("b").value = node("c").value = "5";
            node("b").log.commitIndex = node("c").log.commitIndex = 1;
            layout.invalidate();
            model().controls.show();
        })
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>The cluster has now come to consensus about the system state.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })


        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>This process is called <em>Log Replication</em>.</h2>'
                           + model().controls.html();
            layout.invalidate();
            this.after(200, function () { model().controls.show(); })
        })

        player.play();
    };
});
