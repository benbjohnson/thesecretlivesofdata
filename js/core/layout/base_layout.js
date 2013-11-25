
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["./dialog_layout"], function (DialogLayout) {
    var WIDTH = 100,
        HEIGHT = 100;

    function BaseLayout(selector) {
        this.selector = selector;
        this.dialog = new DialogLayout(this);
    }

    BaseLayout.prototype = playback.layout();

    /**
     * Retrieves the root SVG element.
     */
    BaseLayout.prototype.svg = function () {
        return this._svg;
    };

    /**
     * Initializes the layout.
     */
    BaseLayout.prototype.initialize = function () {
        this._container = $(this.selector);
        this._svg = d3.select(this.selector).append("svg");
        this.scales = {
            x: d3.scale.linear(),
            y: d3.scale.linear(),
        };
        this.dialog.g(this._svg.append("g"));
        this.invalidateSize();
    };

    /**
     * Redraws the entire model.
     */
    BaseLayout.prototype.invalidate = function () {
        this.dialog.invalidate();
    };

    /**
     * Adjusts the size of the layout and adjusts the scales.
     */
    BaseLayout.prototype.invalidateSize = function () {
        var top = 70, bottom = 20,
            width = this._container.width(),
            height = $(window).height() - top - bottom;

        this.scales.x.domain([0, WIDTH]).range([0, width]);
        this.scales.y.domain([0, HEIGHT]).range([0, height]);

        this.svg().attr("width", width).attr("height", height);
        this.dialog.g().attr("transform", "transform(0,0)");

        if (this.model()) {
            this.invalidate();
        }
    };

    return BaseLayout;
});
