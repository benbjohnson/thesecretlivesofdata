
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var DIALOG = {margin: {top: 20, bottom: 20, left: 30, right: 30}},
        H = [
            {height: 36, charWidth: 16.5, margin: {top:20, bottom:10}},
            {height: 30, charWidth: 14.8, margin: {top:20, bottom:10}},
            {height: 24, charWidth: 14, margin: {top:20, bottom:10}},
            {height: 18, charWidth: 13.5, margin: {top:10, bottom:10}},
            {height: 14, charWidth: 13, margin: {top:10, bottom:10}},
        ];

    /**
     * DialogLayout controls the positioning and sizing of the dialog box.
     */
    function DialogLayout(parent) {
        this._parent = parent;
    }

    DialogLayout.prototype = playback.layout();

    /**
     * Retrieves the parent layout.
     */
    DialogLayout.prototype.parent = function () {
        return this._parent;
    };

    /**
     * Sets or retrieves the graphic element to draw on.
     */
    DialogLayout.prototype.g = function (value) {
        if (arguments.length === 0) {
            return this._g;
        }
        this._g = value;
        return this;
    };

    DialogLayout.prototype.invalidate = function () {
        var g,
            self   = this,
            model  = this.parent().model(),
            h      = [],
            y      = DIALOG.margin.top,
            align  = model.dialog.align,
            valign = model.dialog.valign,
            dialogWidth = 0,
            dialogHeight = 0,
            stroked = (model.dialog.h1.length > 0);

        // Calculate line positions.
        model.dialog.h().map(function (_, i) {
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
        g = this.g().selectAll("g.dialog").data([{}])
            .call(function () {
                var x, y;
                if (align === "left") {
                    x = self.parent().scales.x(10);
                } else if (align === "right") {
                    x = self.parent().scales.x(90) - dialogWidth;
                } else {
                    x = (self.parent().scales.x(50) - (dialogWidth / 2));
                }

                if (valign === "top") {
                    y = self.parent().scales.y(10);
                } else if (valign === "bottom") {
                    y = self.parent().scales.y(90) - dialogHeight;
                } else {
                    y = (self.parent().scales.y(40) - (dialogHeight / 2));
                }

                var transform = "translate(" + x + "," + y + ")";
                this.enter().append("g")
                    .attr("class", "dialog")
                    .attr("transform", transform)
                    .call(function () {
                        this.append("rect")
                            .attr("fill", "none");
                    });
                this.transition().duration(1000)
                    .attr("transform", transform);
                this.select("rect")
                    .transition().duration(1000)
                        .attr("width", dialogWidth)
                        .attr("height", dialogHeight);
            });


        // Render dialog text lines.
        g.selectAll("text.h").data(h, function (d) { return d.id; })
            .call(function () {
                this.enter().append("text")
                    .attr("class", function (d) { return "h " + d.className; })
                    .attr("text-anchor", "middle")
                    .attr("dy", "1em");
                this.transition().duration(1000)
                    .attr("x", dialogWidth / 2)
                    .attr("y", function (d) { return d.y; })
                    .text(function (d) { return d.text; });
                this.exit().remove();
            });
    };

    return DialogLayout;
});
