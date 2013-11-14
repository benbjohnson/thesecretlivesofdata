
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["../node", ], function (Node) {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout();

        var index = 0;
        frame.timer(function() {
            model.addNode(new Node(index++));
            layout.invalidateNodes();
        }).interval(1000).times(3).run();
    };
});
