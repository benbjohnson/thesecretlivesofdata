
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./title", "./overview", "./ssr", "./hybrid", "./conclusion"],
    function (title, overview, ssr, hybrid, conclusion){ 
        return function (player) {
            // player.frame("playground", "Playground", playground);
            player.frame("home", "Home", title);
            player.frame("overview", "Overview", overview);
            player.frame("ssr", "Server-Side Routing", ssr);
            player.frame("hybrid", "Hybrid setup", hybrid);
            //player.frame("replicas", "Read Replicas", read_replicas);
            player.frame("conclusion", "Other Resources", conclusion);
        };
    });
