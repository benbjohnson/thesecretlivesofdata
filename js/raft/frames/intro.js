
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

        frame.timer(function () {
            dialog.h3 = ["We'll start with an example..."];
            layout.invalidate();
        }).duration(3000)

        .then(function () {
            dialog.h2 = ["Let's say we have a single node system"];
            dialog.h3 = [];
            dialog.valign = "top";
            layout.invalidate();
        }).duration(2000)
        
        .then(function () {
            model.nodes.create("A");
            layout.invalidate();
        }).duration(2000)

        .then(function () {
            dialog.h2 = ["With only one node, we don't need consensus."];
            layout.invalidate();
        }).duration(2000)

        .then(function () {
            dialog.h2 = ["When a client makes a change to the state of the node,", "the change is immediate."];
            model.clients.create("C");
            layout.invalidate();
        }).duration(2000);

        frame.addEventListener("end", function () {
            dialog.h1 = dialog.h2 = dialog.h3 = [];
            layout.invalidate();
        });

        frame.player().rate(1);
    };
});
