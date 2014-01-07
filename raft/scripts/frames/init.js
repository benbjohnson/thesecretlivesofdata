
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro", "./overview", "./election", "./replication", "./conclusion"],
    function (playground, title, intro, overview, election, replication, conclusion) {
        return function (player) {
            // player.frame("playground", "Playground", playground);
            player.frame("home", "Home", title);
            player.frame("intro", "What is Distributed Consensus?", intro);
            player.frame("overview", "Protocol Overview", overview);
            player.frame("election", "Leader Election", election);
            player.frame("replication", "Log Replication", replication);
            player.frame("conclusion", "Other Resources", conclusion);
        };
    });
