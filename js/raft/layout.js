
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var ANGLE = {3: 30, 5: 50},
        WIDTH = 100,
        HEIGHT = 100,
        NODE_RADIUS = 30;

    function Layout(selector) {
        this.selector = selector;
    }

    Layout.prototype = playback.layout();

    /**
     * Initializes the layout.
     */
    Layout.prototype.initialize = function () {
        this.container = $(this.selector);
        this.svg = d3.select(this.selector).append("svg");
        this.g = this.svg.append("g");
        this.scales = {
            x: d3.scale.linear(),
            y: d3.scale.linear(),
        };
        this.invalidateSize();
    };

    /**
     * Retrieves a list of nodes on the current model.
     */
    Layout.prototype.nodes = function () {
        var model = this.model();
        return (model !== null ? model.nodes() : []);
    };

    /**
     * Redraws the entire model.
     */
    Layout.prototype.invalidate = function () {
        this.invalidateNodes();
    };

    /**
     * Adjusts the size of the layout and adjusts the scales.
     */
    Layout.prototype.invalidateSize = function () {
        var w = $("#chart").width(),
            h = 500;

        this.svg.attr("width", w).attr("height", h);

        this.scales.x.domain([0, WIDTH]).range([0, w]);
        this.scales.y.domain([0, HEIGHT]).range([0, h]);

        this.invalidate();
    };

    /**
     * Repositions and redraws the nodes.
     */
    Layout.prototype.invalidateNodes = function () {
        var self = this,
            nodes = this.nodes();

        this.updateNodeLayout();

        this.g.selectAll(".node").data(nodes)
            .call(function () {
                this.enter().append("circle")
                    .attr("class", "node")
                    .attr("r", function (d) { return d.radius; })
                    .attr("cx", function (d) { return self.scales.x(WIDTH / 2); })
                    .attr("cy", function (d) { return self.scales.y(HEIGHT / 2); })
                    .style("fill", "steelblue");

                this.transition().duration(500)
                    .attr("r", function (d) { return d.radius; })
                    .attr("cx", function (d) { return self.scales.x(d.x); })
                    .attr("cy", function (d) { return self.scales.y(d.y); });
            });
    };

    /**
     * Repositions the nodes.
     */
    Layout.prototype.updateNodeLayout = function () {
        var node, nodes, i, step, angle = ANGLE[this.nodes.length];
        nodes = this.nodes();

        if (angle === undefined) {
            angle = 0;
        }
        angle *=  (Math.PI / 180);

        if (nodes.length === 1) {
            nodes[0].x = WIDTH / 2;
            nodes[0].y = HEIGHT / 2;
        } else {
            step = (2 * Math.PI) / nodes.length;
            for (i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.x = Math.round((WIDTH / 2) + (NODE_RADIUS * Math.cos(angle)));
                node.y = Math.round((HEIGHT / 2) + (NODE_RADIUS * Math.sin(angle)));
                angle += step;
            }
        }
    };

    return Layout;
});
