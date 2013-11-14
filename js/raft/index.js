
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./model", "./layout", "./frames/init", "../domReady!"], function (Model, Layout, frames, doc) {
    var player = playback.player();
    player.layout(new Layout("#chart"));
    player.model(new Model());
    frames(player);
    player.rate(1);
});
