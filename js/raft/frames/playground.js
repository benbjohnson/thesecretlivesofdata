
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout(),
            client, node;

        frame.after(1, function () {
            model.subtitle = '<h1>Test</h1>';
            node = model.nodes.create("A");
            layout.invalidate();
        })

        .after(500, function () {
            model.nodes.create("B");
            model.nodes.create("C");
            layout.invalidate();
        })

        .after(500, function () {
            model.nodes.remove(model.nodes.find("C"));
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
            model.domains.x = [node.x - node.r, node.x + node.r];
            model.domains.y = [node.y - node.r, node.y + node.r];
            layout.invalidate();
        })

        .after(1000, function () {
            model.domains.x = [0, 100];
            model.domains.y = [0, 100];
            layout.invalidate();
        })

        frame.player().rate(1);
    };
});
