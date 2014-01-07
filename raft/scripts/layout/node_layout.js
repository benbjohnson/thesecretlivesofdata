
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var ANGLE = {2: 90, 3: 150, 4: 225, 5: 50},
        ENTRY = {x: 7, y: 5, w:15, h:4},
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
            model = this.parent().model(),
            nodes = this.nodes();

        this.layout(x, y, w, h);

        this.g().selectAll(".node").data(nodes, function (d) { return d.id; })
            .call(function () {
                var transform = function(d) { return "translate(" + self.parent().scales.x(d.x) + "," + self.parent().scales.y(d.y) + ")"; },
                    fill = function (d) { return d.state() === "stopped" ? "gray" : "steelblue"; },
                    stroke = {
                        dash: function (d) { return (d.state() === "candidate" ? "5,5" : ""); },
                        opacity: function (d) { return (d.state() === "follower" || d.state() === "stopped" ? 0 : 1); },
                    };

                var g = this.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", transform);
                g.append("circle")
                    .attr("r", 0)
                    .style("stroke", "black")
                    .style("stroke-width", 5)
                    .style("stroke-dasharray", stroke.dash)
                    .style("stroke-opacity", stroke.opacity)
                    .style("fill", fill);
                g.append("path")
                    .attr("class", "election-timeout")
                    .attr("fill", "white");
                g.append("text")
                    .attr("class", "node-value")
                    .attr("y", "2")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle");
                g.append("text")
                    .attr("class", "node-description")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle");
                g.append("g").attr("class", "log")

                g = this;
                g.each(function(d) { this.__data__.g = this });
                g = g.transition().duration(500);
                g.attr("transform", transform);
                g.select("circle")
                    .attr("r", function (d) { return self.parent().scales.r(d.r); })
                    .style("stroke-dasharray", stroke.dash)
                    .style("stroke-opacity", stroke.opacity)
                    .style("fill", fill);
                g.select("text.node-value")
                    .attr("font-size", function(d) { return self.parent().scales.font(12)})
                    .text(function (d) { return d.value(); });
                g.select("text.node-description")
                    .attr("font-family", "Courier New")
                    .attr("font-size", function(d) { return self.parent().scales.font(8)});

                g.each(function(node) {
                    // Description.
                    var desc = [];
                    desc.push("Node " + node.id);
                    desc.push("Term: " + node.currentTerm());
                    desc.push();
                    if (node.state() === "candidate") {
                        desc.push("Vote Count: " + node.voteCount());
                    } else if (node.leaderId() !== null) {
                        desc.push("Leader: " + node.leaderId());
                    } else if (node.state() === "follower" && node.votedFor() !== null) {
                        desc.push("Voted For: " + node.votedFor());
                    }
                    d3.select(this).select("text.node-description")
                        .attr("y", function (d) {
                            if (d.ypos === "bottom") {
                                return self.parent().scales.r(d.r + 3);
                            } else {
                                return (self.parent().scales.r(d.r + 3) * -1) - (desc.length * self.parent().scales.y(3));
                            }
                        })
                        .selectAll("tspan").data(desc)
                        .call(function() {
                            this.enter().append("tspan").attr("x", 0);
                            this.attr("dy", function (d) { return self.parent().scales.y(3); })
                                .text(function (d) { return d; });
                            this.exit().remove();
                        })
                        .attr("fill-opacity", self.parent().model().nodeLabelVisible ? 1 : 0)

                    // Log
                    d3.select(this).select("g.log").selectAll("g.log-entry").data(node.log())
                        .call(function() {
                            var transform = function(d) { return "translate(" + self.parent().scales.size(d.dx) + "," + self.parent().scales.size(d.dy) + ")"};
                            var text = {
                                x: function(d) { return self.parent().scales.size(0.25); },
                                y: function(d) { return (self.parent().scales.size(d.h) / 2) + 2; },
                                fill: function(d) { return (d.index <= node.commitIndex() ? "black" : "red"); },
                            };
                            var g = this.enter().append("g").attr("class", "log-entry");
                            g.attr("transform", transform);
                            g.append("rect")
                                .attr("shape-rendering", "crispEdges")
                                .attr("stroke", "black")
                                .attr("fill", "white");
                            g.append("text")
                                .attr("x", text.x)
                                .attr("y", text.y)
                                .attr("dominant-baseline", "middle")
                                .attr("font-family", "Courier New")
                                .attr("fill", text.fill);

                            g = this.transition().duration(500)
                                .attr("transform", transform);
                            g.select("rect")
                                .attr("width", function(d) { return self.parent().scales.size(d.w)})
                                .attr("height", function(d) { return self.parent().scales.size(d.h)})
                            g.select("text")
                                .attr("x", text.x)
                                .attr("y", text.y)
                                .attr("fill", text.fill)
                                .attr("font-size", function(d) { return self.parent().scales.font(8) + "px"})
                                .text(function (d) { return d.command; })
                                ;

                            this.exit().remove();
                        })
                })

                g = this.exit()
                    .each(function(d) { this.__data__.g = null });
                g.select("text").remove();
                g.remove();
            });

        this.invalidateElectionTimers();
    };

    NodeLayout.prototype.invalidateElectionTimers = function () {
        var self = this,
            model = this.parent().model(),
            nodes = this.nodes(),
            electionAt = function (d) { return d.electionTimer() !== null ? d.electionTimer().startTime() : 0; };

        this.g().selectAll(".node").data(nodes, function (d) { return d.id; })
            .call(function () {
                this.select("path.election-timeout")
                    .attr("d", function(d) {
                        var r = (!isNaN(d.r) ? d.r : 0);
                        var pct = 0.0;
                        if (electionAt(d) > 0) {
                            pct = 1.0 - Math.min(1, Math.max(0, ((electionAt(d) - model.playhead()) / d.electionTimeout())));
                        }
                        return d3.svg.arc()
                            .innerRadius(self.parent().scales.r(r - 1 - (d.state() === "candidate" ? 2 : 0)))
                            .outerRadius(self.parent().scales.r(r - (d.state() === "candidate" ? 2 : 0)) + 1)
                            .startAngle(0)
                            .endAngle((2 * Math.PI) * pct)
                            .call(d);
                    });
            });
    };

    NodeLayout.prototype.layout = function (x, y, w, h) {
        var i, j, node, entry, step, 
            model = this.parent().model(),
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
                node.xpos = (Math.cos(angle) > 0 ? "right" : "left")
                node.ypos = (Math.sin(angle) > 0 ? "bottom" : "top");
                angle += step;
            }
        }

        for (i = 0; i < nodes.length; i += 1) {
            node = nodes[i];
            nodes[i].r = RADIUS;

            for (j = 0; j < node.log().length; j += 1) {
                entry = node.log()[j];
                entry.dx = ENTRY.x;
                entry.dy = ENTRY.y + (ENTRY.h * j);
                entry.x = node.x + entry.dx;
                entry.y = node.y + entry.dy;
                entry.w = ENTRY.w;
                entry.h = ENTRY.h;
            }
            
        }
    };

    return NodeLayout;
});
