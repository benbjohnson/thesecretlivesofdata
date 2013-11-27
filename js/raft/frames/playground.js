
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            dialog = model.dialog,
            layout = frame.layout(),
            node;

        model.nodes.create("A");
        model.nodes.create("B");
        model.nodes.create("C");
        layout.invalidate();

        frame.after(500, function () {
            model.clients.create("1");
            layout.invalidate();
        })

        .after(500, function () {
            model.clients.create("2");
            layout.invalidate();
        })

        .after(500, function () {
            model.clients.create("3");
            layout.invalidate();
        })

        frame.player().rate(1);
    };
});
