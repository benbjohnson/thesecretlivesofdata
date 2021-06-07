
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout();

        frame.after(1, function() {
            frame.model().clear();
            layout.invalidate();
        })

        .after(100, function () {
            frame.model().title = '<h1 style="visibility:visible">Neo4j</h1>'
                        + '<h2 style="visibility:visible">Understanding the Bolt Server-Side Routing protocol</h2>'
                        + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            frame.model().subtitle = '';
            layout.invalidate();
            frame.model().controls.show();
        })


        .after(100, function () {
            player.next();
        })
        
        player.play();
    };
});
