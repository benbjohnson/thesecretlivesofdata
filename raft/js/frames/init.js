
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./title", "./intro", "./one_node"],
    function (title, intro, one_node) {
        return function (player) {
            player.frame(title);
            player.frame(intro);
            player.frame(one_node);
        };
    });
