
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            model  = frame.model(),
            layout = frame.layout(),
            nodes = {},
            client;

        frame.after(1, function () {
            model.subtitle = '<h1>Test</h1>';
            nodes.a = model.nodes.create("A");
            nodes.a.value = "X";
            layout.invalidate();
        })

        .after(500, function () {
            nodes.b = model.nodes.create("B");
            nodes.c = model.nodes.create("C");
            layout.invalidate();
        })

        .after(500, function () {
            nodes.a.state = "candidate";
            nodes.b.state = "leader";
            layout.invalidate();
            player.pause();
        })

        .after(500, function () {
            client = model.clients.create("1");
            layout.invalidate();
        })

        .after(500, function () {
            client.value = "1";
            layout.invalidate();
        })

        .after(500, function () {
            client.value = "";
            model.send(client, nodes.a, 1000)
            layout.invalidate();
        })

        .after(1000, function () {
            nodes.a.value = "1";
            layout.invalidate();
        })

        .after(500, function () {
            model.zoom(nodes.a);
            layout.invalidate();
        })

        .after(1000, function () {
            model.zoom(null);
            layout.invalidate();
        })

        .after(1000, function () {
            player.next();
        })

        frame.player().rate(1);
    };
});
