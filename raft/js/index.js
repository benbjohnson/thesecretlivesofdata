
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./model", "./layout", "./frames/init", "../../js/domReady!"], function (Model, Layout, frames, doc) {
    var player = playback.player();
    player.layout(new Layout("#chart"));
    player.model(new Model());
    frames(player);
    // player.rate(1);

    $(doc).on("click", "#prevButton", function() {
        player.prev();
    });
    $(doc).on("click", "#nextButton", function() {
        player.next();
    });
    $(doc).on("click", "#helpButton", function() {
        // debugger;
        $("#modal").modal({
            keyboard: false,
            backdrop: false,
        });
    });

    // Update frame index display on change.
    player.onframechange(function() {
        $("#currentIndex").text(player.currentIndex() + 1);
    });
});
