
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro", "./one_node"],
    function (playground, title, intro, one_node) {
        return function (player) {
            player.frame(playground);
            player.frame(title);
            player.frame(intro);
            player.frame(one_node);
        };
    });
