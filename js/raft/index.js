
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./model/model", "./layout/layout", "./frames/init", "../domReady!"], function (Model, Layout, frames, doc) {
    var i, frame,
        player = playback.player();
    player.layout(new Layout("#chart"));
    player.model(new Model());
    player.resizeable(true);
    frames(player);

    function navigateTo(id) {
        var frame = player.frame(id.replace(/^#/, ""));
        if (frame !== null) {
            player.current(frame);
        }
    }
    navigateTo(doc.location.hash);

    // Handle "continue" button click.
    $(doc).on("click", ".tsld-resume", function() {
        player.play();
    });

    // Handle "replay" button click.
    $(doc).on("click", ".tsld-rollback", function() {
        player.current().rollback(2);
        player.layout().invalidate();
        player.play();
    });

    // Handle "hashchange" event.
    $(window).on("hashchange", function() {
        navigateTo(doc.location.hash);
    });

    // Refresh the messages on every frame.
    player.addEventListener("tick", function () {
        player.current().model().tick(player.current().playhead());
        player.layout().messages.invalidate();
    });

    // Left and right arrow click handlers.
    $(doc).keydown(function(e) {
        var button;
        if (e.keyCode == 37) { // LEFT
            button = $(".tsld-rollback");
        } else if (e.keyCode == 39) { // RIGHT
            button = $(".tsld-resume");
        }

        if (button && parseInt(button.css("opacity")) > 0) {
            button.click();
        }
    });

    // Update frame index display on change.
    player.addEventListener("framechange", function () {
        $("#currentIndex").text(player.currentIndex() + 1);
    });

    // Write out the frames to the menu.
    var menu = $("nav .dropdown-menu");
    menu.empty();
    for(i = 0; i < player.frames().length; i += 1) {
        frame = player.frame(i);
        $("nav .dropdown-menu").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#' + frame.id() + '">' + frame.title() + '</a></li>')
    }
});
