
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./intro", "./one_node"],
    function (intro, one_node) {
        return function (player) {
            player.frame(intro);
            player.frame(one_node);
        };
    });
