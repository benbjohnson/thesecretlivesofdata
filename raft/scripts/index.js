
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./model/model", "./layout/layout", "./frames/init", "../../scripts/domReady/domReady-2.0.1!"], function (Model, Layout, frames, doc) {
    var i, menu, frame,
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
    $(doc).on("click", ".btn.resume", function () {
        player.current().model().controls.resume.click();
    });

    // Handle "replay" button click.
    $(doc).on("click", ".btn.rollback", function () {
        player.current().model().controls.rollback.click();
    });

    // Handle "hashchange" event.
    $(window).on("hashchange", function () {
        navigateTo(doc.location.hash);
    });

    // Refresh the messages on every frame.
    player.addEventListener("tick", function () {
        player.current().model().tick(player.current().playhead());
        player.layout().messages.invalidate();
        player.layout().nodes.invalidateElectionTimers();
    });

    // Left and right arrow click handlers.
    $(doc).keydown(function (e) {
        var button;
        if (e.keyCode === 37) { // LEFT
            button = $(".btn.rollback");
        } else if (e.keyCode === 39) { // RIGHT
            button = $(".btn.resume");
        }

        if (button && parseInt(button.css("opacity"), 10) > 0) {
            button.click();
        }
    });

    // Update frame index display on change.
    player.addEventListener("framechange", function () {
        $("#currentIndex").text(player.currentIndex() + 1);
    });

    // Write out the frames to the menu.
    menu = $("nav .dropdown-menu");
    menu.empty();
    for (i = 0; i < player.frames().length; i += 1) {
        frame = player.frame(i);
        $("nav .dropdown-menu").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#' + frame.id() + '">' + frame.title() + '</a></li>');
    }
});
