
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var ANGLE = {3: 30, 5: 50},
        WIDTH = 100,
        HEIGHT = 100,
        NODE_RADIUS = 30,
        DIALOG = {margin: {top: 20, bottom: 20, left: 30, right: 30}},
        H = [
            {height: 36, charWidth: 16.5, margin: {top:20, bottom:10}},
            {height: 30, charWidth: 14.8, margin: {top:20, bottom:10}},
            {height: 24, margin: {top:20, bottom:10}},
            {height: 18, margin: {top:10, bottom:10}},
            {height: 14, margin: {top:10, bottom:10}},
        ];

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
        this.g = {
            messages: this.svg.append("g"),
            nodes:    this.svg.append("g"),
            copy:     this.svg.append("g"),
        };
        this.scales = {
            x: d3.scale.linear(),
            y: d3.scale.linear(),
        };
        this.modal = null;
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
        this.invalidateCopy();
        this.invalidateNodes();
    };

    /**
     * Adjusts the size of the layout and adjusts the scales.
     */
    Layout.prototype.invalidateSize = function () {
        var top = 70, bottom = 20,
            width = $("#chart").width(),
            height = $(window).height() - top - bottom,
            transform = "translate(0, 0)";

        this.svg.attr("width", width).attr("height", height);
        this.g.messages.attr("transform", transform);
        this.g.nodes.attr("transform", transform);
        this.g.copy.attr("transform", transform);

        this.scales.x.domain([0, WIDTH]).range([0, width]);
        this.scales.y.domain([0, HEIGHT]).range([0, height]);

        if (this.model()) {
            this.invalidate();
        }
    };

    /**
     * Shows or hides the modal depending on the copy.
     */
    Layout.prototype.invalidateCopy = function () {
        var self  = this,
            model = this.model(),
            h     = [],
            y     = DIALOG.margin.top,
            dialogWidth = 0,
            dialogHeight = 0;

        // Calculate line positions.
        [model.h1, model.h2, model.h3, model.h4, model.h5].map(function (_, i) {
            _.map(function (d, j) {
                var prevMargin = (h.length > 0 ? h[h.length-1].H.margin.bottom : y);
                y += Math.max(0, H[i].margin.top - prevMargin);
                h.push({
                    id: (i * H.length) + j,
                    className: "h" + (i + 1),
                    text: d,
                    H: H[i],
                    y: y,
                });
                y += H[i].height + H[i].margin.bottom;
                dialogWidth = Math.max(dialogWidth, DIALOG.margin.left + DIALOG.margin.right + (H[i].charWidth * d.length));
            });
        });
        dialogHeight = y + DIALOG.margin.bottom;

        // Render dialog style.
        this.dialog = this.g.copy.selectAll("g.dialog").data([{}])
            .call(function () {
                var transform = "translate(" + (self.scales.x(WIDTH / 2) - (dialogWidth / 2)) + "," + (self.scales.y((HEIGHT * 0.8) / 2) - (dialogHeight / 2)) + ")";
                this.enter().append("g")
                    .attr("class", "dialog")
                    .attr("transform", transform)
                    .call(function () {
                        this.append("rect");
                    });
                this.transition()
                    .attr("transform", transform);
                this.select("rect")
                    .attr("width", dialogWidth)
                    .attr("height", dialogHeight)
                    .attr("stroke", "black")
                    .attr("fill", "none");
            });


        // Render dialog text lines.
        this.dialog.selectAll("text.h").data(h)
            .call(function () {
                this.enter().append("text")
                    .attr("class", function (d) { return "h " + d.className; })
                    .attr("text-anchor", "middle")
                    .attr("dy", "1em")
                    .text(function (d) { return d.text; });
                this.transition()
                    .attr("x", dialogWidth / 2)
                    .attr("y", function (d) { return d.y; });
                this.exit().remove();
            });
    };

    /**
     * Repositions and redraws overlay text.
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
                    .attr("cx", function (d) { return self.scales.x(WIDTH / 2); })
                    .attr("cy", function (d) { return self.scales.y(HEIGHT / 2); })
                    .style("fill", "steelblue");

                this.transition().duration(500)
                    .attr("r", function (d) { return d.radius; })
                    .attr("cx", function (d) { return self.scales.x(d.x); })
                    .attr("cy", function (d) { return self.scales.y(d.y); });

                this.exit().remove();
            });
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
                    .attr("cx", function (d) { return self.scales.x(WIDTH / 2); })
                    .attr("cy", function (d) { return self.scales.y(HEIGHT / 2); })
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
