
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout(),
            node;

        // model.subtitle = '<h1>Test</h1>';
        model.nodes.create("A");
        layout.invalidate();

        frame.after(500, function () {
            model.clients.create("1");
            layout.invalidate();
        })

        .after(500, function () {
            var message = model.messages.create();
            message.source = "1";
            message.target = "A";
            message.sendTime = frame.playhead();
            message.recvTime = frame.playhead() + 1000;
            layout.invalidate();
        })

        frame.player().rate(1);
    };
});
