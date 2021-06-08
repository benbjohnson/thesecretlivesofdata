
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var RADIUS = 5,
        ENTRY = {x: -24, y: 7, w:60, h:4};

    function LbLayout(parent) {
        this._parent = parent;
    }

    LbLayout.WIDTH = 10;

    /**
     * Retrieves the parent layout.
     */
    LbLayout.prototype.parent = function () {
        return this._parent;
    };

    /**
     * Sets or retrieves the graphic element to draw to.
     */
    LbLayout.prototype.g = function (value) {
        if (arguments.length === 0) {
            return this._g;
        }
        this._g = value;
        return this;
    };

    /**
     * Retrieves a list of lbs on the current model.
     */
    LbLayout.prototype.lbs = function () {
        var model = this.parent().model();
        return (model !== null ? model.lbs.toArray() : []);
    };

    LbLayout.prototype.invalidate = function (x, y, w, h) {
        var self = this,
            lbs = this.lbs(),
            fill_color= function (d) { return "orange"} ;

        this.layout(x, y, w, h);

        this.g().selectAll(".lb").data(lbs, function (d) { return d.id; })
            .call(function () {
                var transform = function(d) { return "translate(" + self.parent().scales.x(d.x) + "," + self.parent().scales.y(d.y) + ")"; };

                var g = this.enter().append("g")
                    .attr("class", "lb")
                    .attr("transform", transform);
                g.append("circle")
                    .attr("r", 0)
                    .style("fill", fill_color);
                g.append("path")
                    .attr("class", "election-timeout")
                    .attr("fill", "white");
                g.append("text")
                    .attr("class", "node-value")
                    .attr("y", "2")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle")
                    .style("fill-opacity", 1);
                g.append("text")
                    .attr("class", "node-description")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "end");
                g.append("g").attr("class", "log")

                g = this;
                g.each(function(d) { this.__data__.g = this });
                g = g.transition().duration(500);
                g.attr("transform", transform);
                g.select("circle")
                    .attr("r", function (d) { return self.parent().scales.r(d.r); })
                g.select("text.node-value")
                    .attr("font-size", function(d) { return self.parent().scales.font(10)})
                    .text(function (d) { return d.value(); });
                g.select("text.node-description")
                    .attr("font-family", "Courier New")
                    .attr("font-size", function(d) { return self.parent().scales.font(8)});

                g.each(function(lb) {

                    // Description.
                    var desc = [];
                    desc.push(lb.url());
                    desc.push();
                    d3.select(this).select("text.node-description")
                        .attr("y", function (d) {
                            if (d.ypos === "bottom") {
                                return self.parent().scales.r(d.r + 3);
                            } else {
                                return (self.parent().scales.r(d.r + 3) * -1) - (desc.length * self.parent().scales.y(3));
                            }
                        })
                        // .attr("x", function (d) {
                        //         return (self.parent().scales.r(d.r + 3) * -1) - (lb.url().length * self.parent().scales.y(3));
                        // })
                        .selectAll("tspan").data(desc)
                        .call(function() {
                            this.enter().append("tspan").attr("x", 0);
                            this.attr("dy", function (d) { return self.parent().scales.y(3); })
                                .text(function (d) { return d; });
                            this.exit().remove();
                        })
                        .attr("fill-opacity", self.parent().model().nodeLabelVisible ? 1 : 0)

                    // Log
                    d3.select(this).select("g.log").selectAll("g.log-entry").data(lb.log())
                        .call(function() {
                            var transform = function(d) { return "translate(" + self.parent().scales.size(d.dx) + "," + self.parent().scales.size(d.dy) + ")"};
                            var text = {
                                x: function(d) { return self.parent().scales.size(0.25); },
                                y: function(d) { return (self.parent().scales.size(d.h) / 2) + 2; },
                                fill: function(d) { return  d.color; },
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
                                .attr("font-size", function(d) { return self.parent().scales.font(5) + "px"})
                                .text(function (d) { return d.command; })
                                ;

                            this.exit().remove();
                        })
                })

                g = this.exit()
                    .each(function(d) { this.__data__.g = null });
                g.select("text").style("fill-opacity", 0);//.remove();
                g = g.transition().duration(500)
                g.select("circle").style("fill-opacity", 0);
                g.remove();
            });

        //this.invalidateTimers();
    };



    LbLayout.prototype.layout = function (x, y, w, h) {
        var lb, i, j, entry, step, max_log_entry_len=0,
            lbs = this.lbs();

        for (i = 0; i < lbs.length; i += 1) {
            lb = lbs[i];
            lb.r = RADIUS;
            lb.x = x + (w / 2);
            lb.y = y + ((i + 1) * (h / (lbs.length + 1)));
            max_log_entry_len=0;
            for (j = 0; j < lb.log().length; j += 1) {
                if (lb.log()[j].command.length > max_log_entry_len) {
                    max_log_entry_len = lb.log()[j].command.length
                }
            }
            for (j = 0; j < lb.log().length; j += 1) {
                entry = lb.log()[j];
                entry.dx = ENTRY.x ;
                entry.dy = ENTRY.y + (ENTRY.h * j);
                entry.x = lb.x + lb.dx;
                entry.y = lb.y + lb.dy;
                entry.w =  max_log_entry_len *1.3; //ENTRY.w;
                entry.h = ENTRY.h;
            }
        }
    };

    return LbLayout;
});
