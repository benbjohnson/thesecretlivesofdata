
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout();

        model.title = "Raft: Understandable Consensus";
        model.comment = "In 2013, Diego Ongaro and John Ousterhout published a paper called <i>In Search of an Understandable Consensus Algorithm</i> which proposed a new, simpler way to approach distributed consensus.";
        layout.invalidate();

        frame.onend(function() {
            model.title = model.comment = "";
            layout.invalidate();
        });
    };
});
