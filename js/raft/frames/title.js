
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            model  = frame.model(),
            layout = frame.layout();

        frame.after(1, function() {
            model.clear();
            layout.invalidate();
        })

        .after(500, function () {
            model.title = '<h1 style="visibility:visible">Raft</h1>'
                        + '<h2 style="visibility:visible">Understandable Distributed Consensus</h2>'
                        + '<br/>' + model.controls.resume.html();
            layout.invalidate();
        })
        .after(500, function () {
            model.controls.resume.show();
        })


        .after(100, function () {
            player.next();
        })
        
        player.play();
    };
});
