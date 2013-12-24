
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
            nodes.a._value = "X";
            layout.invalidate();
        })


        frame.player().rate(1);
    };
});
