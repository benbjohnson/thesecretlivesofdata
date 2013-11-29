
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro"],
    function (playground, title, intro) {
        return function (player) {
            player.frame(playground);
            player.frame(title);
            player.frame(intro);
        };
    });
