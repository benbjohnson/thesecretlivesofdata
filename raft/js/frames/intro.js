
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            dialog = model.dialog,
            layout = frame.layout();

        dialog.h1 = [];
        dialog.h2 = ["So What is Distributed Consensus?"];
        layout.invalidate();

        frame.timer(function() {
            dialog.h2 = ["Let's start with an example..."];
            layout.invalidate();

            frame.timer(function() {
                dialog.h2 = ["Let's say we have a single node system"];
                dialog.valign = "top";
                layout.invalidate();
            }).interval(3000).times(1);
        }).interval(3000).times(1);

        frame.onend(function () {
            dialog.h1 = dialog.h2 = [];
            layout.invalidate();
        });

        frame.player().rate(1);
    };
});
