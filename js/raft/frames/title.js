
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            dialog = model.dialog,
            layout = frame.layout();

        dialog.h1 = ["Raft"];
        dialog.h2 = ["Understandable Distributed Consensus"];
        layout.invalidate();

        frame.addEventListener("end", function () {
            dialog.h1 = dialog.h2 = [];
        });
    };
});
