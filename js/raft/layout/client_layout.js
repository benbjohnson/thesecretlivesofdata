
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var CLIENT_RADIUS_PX = 25;

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
                this.enter().append("circle")
                    .attr("class", "client")
                    .attr("r", 0)
                    .style("fill", "green");

                this.transition().duration(500)
                    .attr("r", function (d) { return CLIENT_RADIUS_PX; })
                    .attr("cx", function (d) { return self.parent().scales.x(d.x); })
                    .attr("cy", function (d) { return self.parent().scales.y(d.y); });

                this.exit().remove();
            });
    };

    ClientLayout.prototype.layout = function (x, y, w, h) {
        var client, i, step, 
            clients = this.clients();

        for (i = 0; i < clients.length; i += 1) {
            client = clients[i];
            client.x = x + Math.round(w / 2);
            client.y = y + Math.round((i + 1) * (h / (clients.length + 1)));
        }
    };

    return ClientLayout;
});
