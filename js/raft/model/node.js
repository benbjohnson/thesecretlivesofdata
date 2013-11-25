
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3*/

define([], function () {
    function Node(id) {
        this.id = id;
        this.entries = [];
    }

    /**
     * Clones the node.
     */
    Node.prototype.clone = function () {
        var i, clone = new Node();
        clone.id = this.id;
        return clone;
    };

    return Node;
});
