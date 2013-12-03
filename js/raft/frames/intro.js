
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            model  = frame.model(),
            layout = frame.layout(),
            client, node;

        frame.after(1, function () {
            model.title = '<h2 style="visibility:visible">So What is Distributed Consensus?</h2>'
                        + '<h3 style="visibility:hidden;">Let\'s start with an example...</h3>'
            model.subtitle = model.controls.resume.html();
            layout.invalidate();
        })
        .after(1000, function () {
            layout.fadeIn($(".title h3"));
        })
        .after(1000, function () {
            model.controls.resume.show();
        })
        .after(50, function () {
            model.title = model.subtitle = "";
            layout.invalidate();
        })


        .after(800, function () {
            model.subtitle = "<h2>Let's say we have a single node system</h2>"
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(500, function () {
            node = model.nodes.create("A");
            layout.invalidate();
        })
        .after(200, function () {
            model.controls.resume.show();
        })
        

        .after(10, function () {
            model.subtitle = "<h2>With only one node, we don't need consensus.</h2>"
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(200, function () {
            model.controls.resume.show();
        })


        .after(10, function () {
            model.subtitle = "<h2>Changes to the entire system are immediate.</h2>"
                           + model.controls.resume.html();
            client = model.clients.create("C");
            layout.invalidate();
        })
        .after(1000, function() {
            model.send(client, node, 1000);
        })
        .after(1000, function () {
            model.controls.resume.show();
        })


        frame.addEventListener("end", function () {
            model.title = model.subtitle = "";
            layout.invalidate();
        });

        frame.player().play();
    };
});
