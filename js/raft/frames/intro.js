
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            dialog = model.dialog,
            layout = frame.layout(),
            node;

        dialog.h1 = [];
        dialog.h2 = ["So What is Distributed Consensus?"];
        dialog.h3 = [""];
        layout.invalidate();

        frame.after(3000, function () {
            dialog.h3 = ["We'll start with an example..."];
            layout.invalidate();
        })

        .after(2000, function () {
            dialog.h2 = ["Let's say we have a single node system"];
            dialog.h3 = [];
            dialog.valign = "top";
            layout.invalidate();
        })
        
        .after(2000, function () {
            model.nodes.create("A");
            layout.invalidate();
        })

        .after(2000, function () {
            dialog.h2 = ["With only one node, we don't need consensus."];
            layout.invalidate();
        })

        .after(2000, function () {
            dialog.h2 = ["When a client makes a change to the state of the node,", "the change is immediate."];
            model.clients.create("C");
            layout.invalidate();
        });

        frame.addEventListener("end", function () {
            dialog.h1 = dialog.h2 = dialog.h3 = [];
            layout.invalidate();
        });

        frame.player().rate(1);
    };
});
