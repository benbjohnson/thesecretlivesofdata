
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./model", "./layout", "./frames/init", "../../js/domReady!"], function (Model, Layout, frames, doc) {
    var player = playback.player();
    player.layout(new Layout("#chart"));
    player.model(new Model());
    frames(player);

    $(doc).on("click", ".prev-frame", function() {
        player.prev();
    });
    $(doc).on("click", ".next-frame", function() {
        player.next();
    });
    $(doc).on("click", "#helpButton", function() {
        debugger;
    });

    // Update frame index display on change.
    player.onframechange(function() {
        $("#currentIndex").text(player.currentIndex() + 1);
    });
});
