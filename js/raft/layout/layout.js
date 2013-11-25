
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["../../core/layout/base"], function (BaseLayout) {
    var ANGLE = {3: 30, 5: 50};

    function Layout(selector) {
        BaseLayout.call(this, selector);
    }

    Layout.prototype = new BaseLayout();
    Layout.prototype.constructor = BaseLayout;

    /**
     * Initializes the layout.
     */
    Layout.prototype.initialize = function () {
        BaseLayout.prototype.initialize.call(this);
        this.g = {
            messages: this.svg().append("g"),
            nodes:    this.svg().append("g"),
        };
    };

    /**
     * Retrieves a list of nodes on the current model.
     */
    Layout.prototype.nodes = function () {
        var model = this.model();
        return (model !== null ? model.nodes.toArray() : []);
    };

    /**
     * Redraws the entire model.
     */
    Layout.prototype.invalidate = function () {
        BaseLayout.prototype.invalidate.call(this);
        this.invalidateNodes();
    };

    /**
     * Repositions and redraws the nodes.
     */
    Layout.prototype.invalidateNodes = function () {
        var self = this,
            nodes = this.nodes();

        this.updateNodeLayout();

        this.g.nodes.selectAll(".node").data(nodes, function (d) { return d.id; })
            .call(function () {
                this.enter().append("circle")
                    .attr("class", "node")
                    .attr("r", function (d) { return d.radius; })
                    .attr("cx", function (d) { return self.scales.x(50); })
                    .attr("cy", function (d) { return self.scales.y(50); })
                    .style("fill", "steelblue");

                this.transition().duration(500)
                    .attr("r", function (d) { return d.radius; })
                    .attr("cx", function (d) { return self.scales.x(d.x); })
                    .attr("cy", function (d) { return self.scales.y(d.y); });

                this.exit().remove();
            });
    };

    /**
     * Repositions the nodes.
     */
    Layout.prototype.updateNodeLayout = function () {
        var node, nodes, i, step, angle;
        nodes = this.nodes();
        angle = ANGLE[nodes.length];

        if (angle === undefined) {
            angle = 0;
        }
        angle *=  (Math.PI / 180);

        if (nodes.length === 1) {
            nodes[0].x = 50 / 2;
            nodes[0].y = 50 / 2;
        } else {
            step = (2 * Math.PI) / nodes.length;
            for (i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.x = Math.round((50 / 2) + (NODE_RADIUS * Math.cos(angle)));
                node.y = Math.round((50 / 2) + (NODE_RADIUS * Math.sin(angle)));
                angle += step;
            }
        }
    };

    return Layout;
});
