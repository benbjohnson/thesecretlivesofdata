
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3*/

define(["./log", "./bbox"], function (Log, BBox) {
    function Node(id) {
        this.id = id;
        this.state = "follower";
        this.value = "";
        this.log = new Log();
    }

    /**
     * Determines the bounding box of the node and its log.
     */
    Node.prototype.bbox = function () {
        var bbox = new BBox(this.y - this.r, this.x + this.r, this.y + this.r, this.x - this.r);
        bbox = bbox.union(this.log.bbox());
        return bbox;
    };

    /**
     * Clones the node.
     */
    Node.prototype.clone = function () {
        var i, clone = new Node();
        clone.id = this.id;
        clone.log = this.log.clone();
        return clone;
    };

    return Node;
});
