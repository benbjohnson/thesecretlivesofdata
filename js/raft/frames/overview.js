
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            model  = frame.model(),
            layout = frame.layout(),
            nodes = {},
            clients = {};

        frame.after(1, function() {
            model.clear();
            nodes.a = model.nodes.create("A");
            nodes.b = model.nodes.create("B");
            nodes.c = model.nodes.create("C");
            layout.invalidate();
        })

        .after(800, function () {
            model.subtitle = '<h2><em>Raft</em> is a protocol for implementing distributed consensus.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.subtitle = '<h2>Let\'s look at a high level overview of how it works.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })


        .after(300, function () {
            model.zoom([nodes.b]);
            model.subtitle = '<h2>A node can be in 1 of 3 states:</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            nodes.b.state = "follower";
            model.subtitle = '<h2>The <em>Follower</em> state,</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            nodes.b.state = "candidate";
            model.subtitle = '<h2>the <em>Candidate</em> state,</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            nodes.b.state = "leader";
            model.subtitle = '<h2>or the <em>Leader</em> state.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })


        .after(300, function () {
            model.zoom(null);
            nodes.b.state = "follower";
            model.subtitle = '<h2>All our nodes start in the follower state.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.subtitle = '<h2>If followers don\'t hear from a leader then they can become a candidate.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            nodes.a.state = "candidate";
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.subtitle = '<h2>The candidate then requests votes from other nodes.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(300, function () {
            model.send(nodes.a, nodes.b, 1000)
            model.send(nodes.a, nodes.c, 1000)
            layout.invalidate();
        })
        .after(1000, function () { model.controls.resume.show(); })
        .after(100, function () {
            model.subtitle = '<h2>Nodes will reply with their vote.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(300, function () {
            model.send(nodes.b, nodes.a, 1000)
            model.send(nodes.c, nodes.a, 1000)
            layout.invalidate();
        })
        .after(1000, function () {
            nodes.a.state = "leader";
            layout.invalidate();
            model.controls.resume.show();
        })
        .after(100, function () {
            model.subtitle = '<h2>The candidate becomes the leader if it gets votes from a majority of nodes.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.subtitle = '<h2>This process is called <em>Leader Election</em>.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })


        .after(300, function () {
            model.subtitle = '<h2>All changes to the system now go through the leader.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.subtitle += " ";
            clients.x = model.clients.create("X");
            layout.invalidate();
        })
        .after(1000, function () {
            clients.x.value = "5";
            layout.invalidate();
        })
        .after(500, function () {
            model.send(clients.x, nodes.a, 1000);
            layout.invalidate();
        })
        .after(1000, function () {
            nodes.a.log.append(1, 1, "SET 5");
            layout.invalidate();
            model.controls.resume.show();
        })
        .after(100, function () {
            model.subtitle = '<h2>Each change is added as an entry in the node\'s log.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.subtitle = '<h2>This log entry is currently uncommitted so it won\'t update the node\'s value.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.send(nodes.a, nodes.b, 1000)
            model.send(nodes.a, nodes.c, 1000)
            model.subtitle = '<h2>To commit the entry the node first replicates it to the follower nodes...</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(1000, function () {
            nodes.b.log.append(1, 1, "SET 5");
            nodes.c.log.append(1, 1, "SET 5");
            layout.invalidate();
            model.controls.resume.show();
        })
        .after(100, function () {
            model.send(nodes.b, nodes.a, 1000)
            model.send(nodes.c, nodes.a, 1000)
            model.subtitle = '<h2>then the leader waits until a majority of nodes have written the entry.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(1000, function () {
            nodes.a.log.commitIndex = 1;
            nodes.a.value = "5";
            layout.invalidate();
            model.controls.resume.show();
        })
        .after(100, function () {
            model.subtitle = '<h2>The entry is now committed on the leader node and the node state is "5".</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })
        .after(300, function () {
            model.send(nodes.a, nodes.b, 1000)
            model.send(nodes.a, nodes.c, 1000)
            model.subtitle = '<h2>The leader then notifies the followers that the entry is committed.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(1000, function () {
            nodes.b.value = nodes.c.value = "5";
            nodes.b.log.commitIndex = nodes.c.log.commitIndex = 1;
            layout.invalidate();
            model.controls.resume.show();
        })
        .after(100, function () {
            model.subtitle = '<h2>The cluster has now come to consensus about the system state.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })


        .after(300, function () {
            model.subtitle = '<h2>This process is called <em>Log Replication</em>.</h2>'
                           + model.controls.resume.html();
            layout.invalidate();
            this.after(200, function () { model.controls.resume.show(); })
        })

        player.play();
    };
});
