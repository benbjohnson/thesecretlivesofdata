
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            client = function(id) {
                return frame.model().clients.find(id);
            },
            node = function(id) {
                return frame.model().nodes.find(id);
            };

        frame.after(1, function() {
            frame.snapshot();
            frame.model().clear();
            layout.invalidate();
        })

        .after(1000, function () {
            frame.model().title = '<h2 style="visibility:visible">So What is Distributed Consensus?</h2>'
                        + '<h3 style="visibility:hidden;">Let\'s start with an example...</h3>'
                        + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            layout.fadeIn($(".title h3"));
        })
        .after(1000, function () {
            frame.model().controls.show();
        })
        .after(50, function () {
            frame.model().title = frame.model().subtitle = "";
            layout.invalidate();
        })


        .after(800, function () {
            frame.snapshot();
            frame.model().subtitle = '<h2>Let\'s say we have a single node system</h2>'
                           + frame.model().controls.html();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().nodes.create("a");
            layout.invalidate();
        })
        .after(100, function () { frame.model().controls.show(); })

        .after(100, function () {
            frame.snapshot();
            frame.model().subtitle = "";
            frame.model().zoom([node("a")]);
            layout.invalidate();
        })
        .after(600, function () {
            frame.model().subtitle = '<h3>For this example, you can think of our <span style="color:steelblue">node</span> as a database server that stores a single value.</h3>'
                           + frame.model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            node("a").value = "x";
            layout.invalidate();
        })
        .after(100, function () { frame.model().controls.show(); })        

        .after(100, function () {
            frame.snapshot();
            frame.model().subtitle = "";
            frame.model().zoom(null);
            layout.invalidate();
        })
        .after(1000, function () {
            frame.model().subtitle = '<h3>We also have a <span style="color:green">client</span> that can send a value to the server.</h3>'
                           + frame.model().controls.html();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().clients.create("X");
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().controls.show();
        })


        .after(100, function () {
            frame.snapshot();
            frame.model().subtitle += "";
            client("X").value = "8";
            layout.invalidate();
        })
        .after(1000, function () {
            frame.model().send(client("X"), node("a"));
            layout.invalidate();
        })
        .after(1000, function () {
            node("a").value = "8";
            layout.invalidate();
        })
        .after(100, function () {
            frame.model().subtitle = '<h3>Coming to agreement on that value, or <em>consensus</em>, is easy with one node.</h3>'
                           + frame.model().controls.html();
            layout.invalidate();
            frame.model().controls.show();
        })


        .after(100, function () {
            frame.snapshot();
            frame.model().subtitle = '<h3>But how do we come to consensus if we have multiple nodes?</h3>'
                           + frame.model().controls.html();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().nodes.create("b");
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().nodes.create("c");
            layout.invalidate();
        })
        .after(100, function () {
            frame.model().controls.show();
        })


        .after(100, function () {
            frame.snapshot();
            frame.model().subtitle = '<h3>That\'s the problem of <em>distributed consensus</em>.</h3>'
                           + frame.model().controls.html();
            layout.invalidate();
            this.after(200, function () { frame.model().controls.show(); });
        })

        .after(300, function () {
            frame.snapshot();
            player.next();
        })


        frame.addEventListener("end", function () {
            frame.model().title = frame.model().subtitle = "";
            layout.invalidate();
        });

        player.play();
    };
});
