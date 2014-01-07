
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    function PartitionLayout(parent) {
        this._parent = parent;
    }

    PartitionLayout.WIDTH = 3;

    /**
     * Retrieves the parent layout.
     */
    PartitionLayout.prototype.parent = function () {
        return this._parent;
    };

    /**
     * Sets or retrieves the graphic element to draw to.
     */
    PartitionLayout.prototype.g = function (value) {
        if (arguments.length === 0) {
            return this._g;
        }
        this._g = value;
        return this;
    };

    /**
     * Retrieves a list of partitions on the current model.
     */
    PartitionLayout.prototype.partitions = function () {
        var model = this.parent().model();
        return (model !== null ? model.partitions.toArray() : []);
    };

    PartitionLayout.prototype.invalidate = function (x, y, w, h) {
        var self = this,
            partitions = this.partitions();

        this.g().selectAll(".partition").data(partitions, function (d) { return d.id; })
            .call(function () {
                var transform = function(d) { return "translate(" + self.parent().scales.x(d.x1) + "," + self.parent().scales.y(d.y1) + ")"; };

                var g = this.enter().append("g")
                    .attr("class", "partition")
                    .attr("transform", transform);
                g.append("line")
                    .attr("stroke-width", function (d) { return self.parent().scales.r(PartitionLayout.WIDTH); })
                    .style("stroke", "#333")
                    .style("stroke-dasharray", "5,5")
                    .style("stroke-opacity", 0);

                this.transition().duration(500)
                    .attr("transform", transform)
                    .select("line")
                        .style("stroke-opacity", 1)
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", function (d) { return self.parent().scales.x(d.x2) - self.parent().scales.x(d.x1); })
                        .attr("y2", function (d) { return self.parent().scales.y(d.y2) - self.parent().scales.y(d.y1); });

                this.exit()
                    .transition().duration(500)
                    .select("line").style("stroke-opacity", 0)
                    .remove();
            });
    };

    return PartitionLayout;
});
