
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./model/model", "./layout/layout", "./frames/init", "../domReady!"], function (Model, Layout, frames, doc) {
    var player = playback.player();
    player.layout(new Layout("#chart"));
    player.model(new Model());
    player.resizeable(true);
    frames(player);

    $(doc).on("click", ".prev-frame", function () {
        player.prev();
    });
    $(doc).on("click", ".next-frame", function () {
        player.next();
    });
    $(doc).on("click", "#helpButton", function () {
    });

    $(doc).on("click", ".tsld-rollback", function() {
        player.current().rollback(2);
        player.layout().invalidate();
        player.play();
    });
    $(doc).on("click", ".tsld-resume", function() {
        player.play();
    });

    player.addEventListener("tick", function () {
        player.current().model().tick(player.current().playhead());
        player.layout().messages.invalidate();
    });

    // Update frame index display on change.
    player.addEventListener("framechange", function () {
        $("#currentIndex").text(player.currentIndex() + 1);
    });
});
