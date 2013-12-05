
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            model  = frame.model(),
            layout = frame.layout(),
            client, node;

        frame.after(1, function () {
            model.subtitle = '<h1>Test</h1>';
            node = model.nodes.create("A");
            node.value = "X";
            layout.invalidate();
        })

        .after(500, function () {
            model.nodes.create("B");
            model.nodes.create("C");
            layout.invalidate();
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
            model.send(client, node, 1000)
            layout.invalidate();
        })

        .after(1000, function () {
            node.value = "1";
            layout.invalidate();
        })

        .after(500, function () {
            model.zoom(node);
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
