
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro", "./overview"],
    function (playground, title, intro, overview) {
        return function (player) {
            // player.frame("playground", "Playground", playground);
            player.frame("home", "Home", title);
            player.frame("intro", "What is Distributed Consensus?", intro);
            player.frame("overview", "Protocol Overview", overview);
        };
    });
