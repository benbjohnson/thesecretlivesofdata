
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout(),
            client, node;

        model.title = "<h2>So What is Distributed Consensus?</h2>"
                    + "<h3>&nbsp;</h3>";
        layout.invalidate();

        frame.after(1000, function () {
            model.title = "<h2>So What is Distributed Consensus?</h2>"
                        + "<h3>Let's start with an example...</h3>";
            layout.invalidate();
        })

        .after(2000, function () {
            model.title = "";
            model.subtitle = "<h2>Let's say we have a single node system</h2>";
            layout.invalidate();

            this.after(500, function () {
                node = model.nodes.create("A");
                layout.invalidate();
            });
        })
        
        .after(2000, function () {
            model.subtitle = "<h2>With only one node, we don't need consensus.</h2>";
            layout.invalidate();
        })

        .after(2000, function () {
            model.subtitle = "<h2>When a client makes a change to the state of the node, the change is immediate.</h2>";
            client = model.clients.create("C");
            layout.invalidate();

            this.after(1000, function() {
                model.send(client, node, 1000);
            });
        });

        frame.addEventListener("end", function () {
            model.subtitle = "";
            layout.invalidate();
        });

        frame.player().rate(1);
    };
});
