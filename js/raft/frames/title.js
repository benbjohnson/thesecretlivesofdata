
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout();

        model.title = "<h1>Raft</h1><h2>Understandable Distributed Consensus</h2>";
        layout.invalidate();

        frame.addEventListener("end", function () {
            model.title = "";
        });
    };
});
