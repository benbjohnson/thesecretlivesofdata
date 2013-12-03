
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
            layout.invalidate();
        })

        .after(500, function () {
            client = model.clients.create("1");
            layout.invalidate();
        })

        .after(500, function () {
            model.send(client, node, 1000)
            layout.invalidate();
        })

        frame.player().rate(1);
    };
});
