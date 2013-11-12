
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3*/

define([], function () {
    function Node(id) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.radius = 25;
        this.entries = [];
    }

    return Node;
});
