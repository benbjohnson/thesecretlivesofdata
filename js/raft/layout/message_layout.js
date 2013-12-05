
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var RADIUS = 2;

    function MessageLayout(parent) {
        this._parent = parent;
    }

    MessageLayout.prototype.parent = function () {
        return this._parent;
    };

    MessageLayout.prototype.g = function (value) {
        if (arguments.length === 0) {
            return this._g;
        }
        this._g = value;
        return this;
    };

    /**
     * Retrieves a list of messages on the current model.
     */
    MessageLayout.prototype.messages = function () {
        var model = this.parent().model();
        return (model !== null ? model.messages.toArray() : []);
    };

    MessageLayout.prototype.invalidate = function () {
        var self = this,
            messages = this.messages(),
            rdomain = this.parent().scales.r.domain(),
            rscaling = (this.rprev === undefined || this.rprev[0] !== rdomain[0] || this.rprev[1] !== rdomain[1]),
            r = function (d) { return self.parent().scales.r(d.r); };
        this.rprev = rdomain;

        this.layout();

        this.g().selectAll(".message").data(messages, function (d) { return d.id; })
            .call(function () {
                this.enter().append("circle")
                    .attr("class", "message")
                    .attr("r", r)
                    .style("fill", "red")
                    .each(function(d) { this.__data__.g = this });

                this.attr("cx", function (d) { return d.x_px; })
                    .attr("cy", function (d) { return d.y_px; });

                // Scale r only if the domain has changed.
                if (rscaling) {
                    this.transition().duration(500)
                        .attr("r", r);
                }

                this.exit()
                    .each(function(d) { this.__data__.g = null })
                    .remove();
            });
    };

    MessageLayout.prototype.layout = function () {
        var message, i, pct, source, target,
            model = this.parent().model(),
            messages = this.messages();

        for (i = 0; i < messages.length; i += 1) {
            message = messages[i];
            source = model.find(message.source).g.transform.baseVal.getItem(0).matrix;
            target = model.find(message.target).g.transform.baseVal.getItem(0).matrix;
            pct = (this.parent().current().playhead() - message.sendTime) / (message.recvTime - message.sendTime);

            message.x_px = source.e + ((target.e - source.e) * pct);
            message.y_px = source.f + ((target.f - source.f) * pct);
            message.r = RADIUS;
        }
    };

    return MessageLayout;
});
