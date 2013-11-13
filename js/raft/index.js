
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./model", "./layout", "./node", "../domReady!"], function (Model, Layout, Node, doc) {
    var player = playback.player();

    player.layout(new Layout("#chart"));
    player.model(new Model());

    player.frame(function (frame) {
        var model = frame.model();
        var index = 0;
        frame.timer(function() {
            model.addNode(new Node(index++));
            player.layout().invalidateNodes();
        }).interval(500).times(3);
    });

    player.play();
});
