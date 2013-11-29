
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var RADIUS_PX = 10;

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
            messages = this.messages();

        this.layout();

        this.g().selectAll(".message").data(messages, function (d) { return d.id; })
            .call(function () {
                this.enter().append("circle")
                    .attr("class", "message")
                    .attr("r", function (d) { return RADIUS_PX; })
                    .style("fill", "red");

                this.attr("cx", function (d) { return Math.round(self.parent().scales.x(d.x)); })
                    .attr("cy", function (d) { return Math.round(self.parent().scales.y(d.y)); });

                this.exit().remove();
            });
    };

    MessageLayout.prototype.layout = function () {
        var message, i, pct, source, target,
            model = this.parent().model(),
            messages = this.messages();

        for (i = 0; i < messages.length; i += 1) {
            message = messages[i];
            source = model.find(message.source);
            target = model.find(message.target);
            pct = (this.parent().current().playhead() - message.sendTime) / (message.recvTime - message.sendTime);

            message.x = source.x + ((target.x - source.x) * pct);
            message.y = source.y + ((target.y - source.y) * pct);
        }
    };

    return MessageLayout;
});
