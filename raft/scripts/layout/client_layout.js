
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var RADIUS = 5;

    function ClientLayout(parent) {
        this._parent = parent;
    }

    ClientLayout.WIDTH = 10;

    /**
     * Retrieves the parent layout.
     */
    ClientLayout.prototype.parent = function () {
        return this._parent;
    };

    /**
     * Sets or retrieves the graphic element to draw to.
     */
    ClientLayout.prototype.g = function (value) {
        if (arguments.length === 0) {
            return this._g;
        }
        this._g = value;
        return this;
    };

    /**
     * Retrieves a list of clients on the current model.
     */
    ClientLayout.prototype.clients = function () {
        var model = this.parent().model();
        return (model !== null ? model.clients.toArray() : []);
    };

    ClientLayout.prototype.invalidate = function (x, y, w, h) {
        var self = this,
            clients = this.clients();

        this.layout(x, y, w, h);

        this.g().selectAll(".client").data(clients, function (d) { return d.id; })
            .call(function () {
                var transform = function(d) { return "translate(" + self.parent().scales.x(d.x) + "," + self.parent().scales.y(d.y) + ")"; };

                var g = this.enter().append("g")
                    .attr("class", "client")
                    .attr("transform", transform);
                g.append("circle")
                    .attr("r", 0)
                    .style("fill", "green");
                g.append("text")
                    .attr("y", "2")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle");

                g = this;
                g.each(function(d) { this.__data__.g = this });
                g = g.transition().duration(500);
                g.attr("transform", transform);
                g.select("circle")
                    .attr("r", function (d) { return self.parent().scales.r(d.r); })
                g.select("text")
                    .attr("font-size", function(d) { return self.parent().scales.font(12)})
                    .text(function (d) { return d.value(); });

                g = this.exit()
                    .each(function(d) { this.__data__.g = null });
                g.select("text").remove();
                g = g.transition().duration(500)
                g.select("circle").style("fill-opacity", 0);
                g.remove();
            });
    };

    ClientLayout.prototype.layout = function (x, y, w, h) {
        var client, i, step, 
            clients = this.clients();

        for (i = 0; i < clients.length; i += 1) {
            client = clients[i];
            client.r = RADIUS;
            client.x = x + (w / 2);
            client.y = y + ((i + 1) * (h / (clients.length + 1)));
        }
    };

    return ClientLayout;
});
