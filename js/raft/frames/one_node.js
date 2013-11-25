
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout(),
            index = 0;

        frame.timer(function () {
            var node = model.newNode(index);
            model.addNode(node);
            index += 1;
            layout.invalidateNodes();
        }).interval(750).times(2).run().run();

        frame.player().rate(1);
    };
});
