
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            model  = frame.model(),
            layout = frame.layout(),
            client, node;

        frame.after(1, function() {
            model.clear();
            layout.invalidate();
        })

        .after(1000, function () {
            model.title = '<h2 style="visibility:visible">So What is Distributed Consensus?</h2>'
                        + '<h3 style="visibility:hidden;">Let\'s start with an example...</h3>'
                        + '<br/>' + model.controls.resume.html();
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
            model.subtitle = '<h2>Let\'s say we have a single node system</h2>'
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


        .after(100, function () {
            model.subtitle = "";
            model.zoom(node);
            layout.invalidate();
        })
        .after(600, function () {
            model.subtitle = '<h3>For this example, you can think of our <span style="color:steelblue">node</span> as a database server that stores a single value.</h3>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(1000, function () {
            node.value = "x";
            layout.invalidate();
        })
        .after(100, function () {
            model.controls.resume.show();
        })
        

        .after(100, function () {
            model.subtitle = "";
            model.zoom(null);
            layout.invalidate();
        })
        .after(1000, function () {
            model.subtitle = '<h3>We also have a <span style="color:green">client</span> that can send a value to the server.</h3>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(500, function () {
            client = model.clients.create("C");
            layout.invalidate();
        })
        .after(500, function () {
            model.controls.resume.show();
        })


        .after(100, function () {
            client.value = "8";
            layout.invalidate();
        })
        .after(1000, function () {
            model.send(client, node, 1000);
            layout.invalidate();
        })
        .after(1000, function () {
            node.value = "8";
            layout.invalidate();
        })
        .after(100, function () {
            model.subtitle = '<h3>Coming to agreement on that value, or <em>consensus</em>, is easy with one node.</h3>'
                           + model.controls.resume.html();
            layout.invalidate();
            model.controls.resume.show();
        })


        .after(100, function () {
            model.subtitle = '<h3>But how do we come to consensus if we have multiple nodes?</h3>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(500, function () {
            model.nodes.create("B");
            layout.invalidate();
        })
        .after(500, function () {
            model.nodes.create("C");
            layout.invalidate();
        })
        .after(100, function () {
            model.controls.resume.show();
        })


        .after(100, function () {
            model.subtitle = '<h3>That\'s the problem of <em>distributed consensus</em>.</h3>'
                           + model.controls.resume.html();
            layout.invalidate();
        })
        .after(100, function () {
            model.controls.resume.show();
        })


        .after(100, function () {
            player.next();
        })


        frame.addEventListener("end", function () {
            model.title = model.subtitle = "";
            layout.invalidate();
        });

        player.play();
    };
});
