
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout();

        frame.after(1, function() {
            frame.model().clear();
            layout.invalidate();
        })

        .after(500, function () {
            frame.model().title = '<h1 style="visibility:visible">The End</h1>'
                        + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().controls.show();
        })

        .after(500, function () {
            frame.model().title = '<h4 style="visibility:visible">based on <a href="http://thesecretlivesofdata.com/raft/">The secret lives of data</a> by Ben Johnson</h4>'
                + '<h2 style="visibility:visible">.</h2>'
                + '<h2 style="visibility:visible">For more information :</h2>'
                + '<h3 style="visibility:visible"><a href="http://thesecretlivesofdata.com/raft/">Raft: Understandable Distributed Consensus</a></h3>'
                + '<h3 style="visibility:visible"><a href="https://neo4j.com/docs/driver-manual/current/">The Neo4j Drivers Manual</a></h3>'
                + '<h3 style="visibility:visible"><a href="https://7687.org/">7687.org : the Bolt protocol in details</a></h3>'
                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        
        player.play();
    };
});
