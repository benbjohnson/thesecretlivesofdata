
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3*/

define(["./node"], function (Node) {
    var ANGLE = {3:30, 5:50};

    function Model() {
        this.width = 100;
        this.height = 100;
        this.radius = 30;
        this.nodes = [];
    }

    Model.prototype.addNode = function (node) {
        this.nodes.push(node);
        this.layoutNodes();
    }

    Model.prototype.removeNode = function (node) {
        var index = this.nodes.indexOf(node);
        if (index !== -1) {
            this.nodes.splice(index, 1);
        }
        this.layoutNodes();
    }

    /**
     * Lays out the nodes in the model in a circle.
     */
    Model.prototype.layoutNodes = function () {
        var node, i, step, angle = ANGLE[this.nodes.length];

        if (angle === undefined) {
            angle = 0;
        }
        angle *=  (Math.PI / 180);

        if (this.nodes.length == 1) {
            this.nodes[0].x = this.width / 2;
            this.nodes[0].y = this.height / 2;
        } else {
            step = (2 * Math.PI) / this.nodes.length;
            for (i = 0; i < this.nodes.length; i += 1) {
                node = this.nodes[i];
                node.x = Math.round((this.width/2) + (this.radius * Math.cos(angle)));
                node.y = Math.round((this.height/2) + (this.radius * Math.sin(angle)));
                angle += step;
            }
        }
    }

    return Model;
});
