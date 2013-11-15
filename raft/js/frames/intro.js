
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout();

        model.h1 = "Raft";
        model.h2 = "Understandable Distributed Consensus";
        layout.invalidate();

        frame.onend(function () {
            model.title = model.comment = "";
            layout.invalidate();
        });
    };
});
