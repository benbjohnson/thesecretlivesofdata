
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var ANGLE = {3: 30, 5: 50},
        NODE_RADIUS_PX = 25,
        CLUSTER_RADIUS = 25;

    function NodeLayout(parent) {
        this._parent = parent;
    }

    /**
     * Retrieves the parent layout.
     */
    NodeLayout.prototype.parent = function () {
        return this._parent;
    };

    /**
     * Sets or retrieves the graphic element to draw to.
     */
    NodeLayout.prototype.g = function (value) {
        if (arguments.length === 0) {
            return this._g;
        }
        this._g = value;
        return this;
    };

    /**
     * Retrieves a list of nodes on the current model.
     */
    NodeLayout.prototype.nodes = function () {
        var model = this.parent().model();
        return (model !== null ? model.nodes.toArray() : []);
    };

    NodeLayout.prototype.invalidate = function (x, y, w, h) {
        var self = this,
            nodes = this.nodes();

        this.updateNodeLayout(x, y, w, h);

        this.g().selectAll(".node").data(nodes, function (d) { return d.id; })
            .call(function () {
                this.enter().append("circle")
                    .attr("class", "node")
                    .attr("r", function (d) { return NODE_RADIUS_PX; })
                    .attr("cx", function (d) { return self.parent().scales.x(x + (w / 2)); })
                    .attr("cy", function (d) { return self.parent().scales.y(y + (h / 2)); })
                    .style("fill", "steelblue");

                this.transition().duration(500)
                    .attr("r", function (d) { return NODE_RADIUS_PX; })
                    .attr("cx", function (d) { return self.parent().scales.x(d.x); })
                    .attr("cy", function (d) { return self.parent().scales.y(d.y); });

                this.exit().remove();
            });
    };

    NodeLayout.prototype.updateNodeLayout = function (x, y, w, h) {
        var node, i, step, 
            nodes = this.nodes(),
            angle = ANGLE[nodes.length];

        if (angle === undefined) {
            angle = 0;
        }
        angle *= (Math.PI / 180);

        if (nodes.length === 1) {
            nodes[0].x = x + (w / 2);
            nodes[0].y = y + (h / 2);
        } else {
            step = (2 * Math.PI) / nodes.length;
            for (i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.x = Math.round(x + (w / 2) + (CLUSTER_RADIUS * Math.cos(angle)));
                node.y = Math.round(y + (h / 2) + (CLUSTER_RADIUS * Math.sin(angle)));
                angle += step;
            }
        }
    };

    return NodeLayout;
});
