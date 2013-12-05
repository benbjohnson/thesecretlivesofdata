
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var ANGLE = {2: 90, 3: 120, 5: 50},
        RADIUS = 5;

    function NodeLayout(parent) {
        this._parent = parent;
    }

    NodeLayout.WIDTH = 25;

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

        this.layout(x, y, w, h);

        this.g().selectAll(".node").data(nodes, function (d) { return d.id; })
            .call(function () {
                var transform = function(d) { return "translate(" + self.parent().scales.x(d.x) + "," + self.parent().scales.y(d.y) + ")"; },
                    stroke = {
                        dash: function (d) { return (d.state === "candidate" ? "5,5" : ""); },
                        opacity: function (d) { return (d.state === "follower" ? 0 : 1); },
                    };

                var g = this.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", transform)
                    .each(function(d) { this.__data__.g = this });
                g.append("circle")
                    .attr("r", 0)
                    .style("stroke", "black")
                    .style("stroke-width", 3)
                    .style("stroke-dasharray", stroke.dash)
                    .style("stroke-opacity", stroke.opacity)
                    .style("fill", "steelblue");
                g.append("text")
                    .attr("y", "2")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle");

                g = this;
                g = g.transition().duration(500);
                g.attr("transform", transform);
                g.select("circle")
                    .attr("r", function (d) { return self.parent().scales.r(d.r); })
                    .style("stroke-dasharray", stroke.dash)
                    .style("stroke-opacity", stroke.opacity);
                g.select("text")
                    .attr("font-size", function(d) { return self.parent().scales.font(12)})
                    .text(function (d) { return d.value; });

                g = this.exit()
                    .each(function(d) { this.__data__.g = null });
                g.select("text").remove();
                g = g.transition().duration(500)
                g.select("circle")
                    .style("stroke-opacity", 0)
                    .style("fill-opacity", 0);
                g.remove();
            });
    };

    NodeLayout.prototype.layout = function (x, y, w, h) {
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
                node.x = x + (w / 2) + ((w / 2) * Math.cos(angle));
                node.y = y + (h / 2) + ((w / 1.125) * Math.sin(angle));
                angle += step;
            }
        }

        for (i = 0; i < nodes.length; i += 1) {
            nodes[i].r = RADIUS;
        }
    };

    return NodeLayout;
});
