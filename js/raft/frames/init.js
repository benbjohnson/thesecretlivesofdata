
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro", "./overview"],
    function (playground, title, intro, overview) {
        return function (player) {
            //player.frame(playground);
            player.frame(title);
            player.frame(intro);
            player.frame(overview);
        };
    });
