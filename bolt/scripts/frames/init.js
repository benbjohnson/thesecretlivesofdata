
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./overview", "./bolt_routing", "./initial_resolution", "./read_replicas", "./conclusion"],
    function (playground, title, overview, bolt_routing, initial_resolution, read_replicas, conclusion) {
        return function (player) {
            // player.frame("playground", "Playground", playground);
            player.frame("home", "Home", title);
            player.frame("overview", "Protocol Overview", overview);
            player.frame("bolt_routing", "bolt+routing", bolt_routing);
            player.frame("initial", "Initial address resolution", initial_resolution);
            //player.frame("replicas", "Read Replicas", read_replicas);
            player.frame("conclusion", "Other Resources", conclusion);
        };
    });
