
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var WIDTH = 100,
        HEIGHT = 100;

    function BaseLayout(selector) {
        this.selector = selector;
        this.padding = {
            top: 70,
            bottom: 20,
            left: 0,
            right: 0,
        };
    }

    BaseLayout.prototype = playback.layout();

    /**
     * Initializes the layout.
     */
    BaseLayout.prototype.initialize = function () {
        this.container = $(this.selector);
        this.svg = d3.select(this.selector).append("svg");
        this.subtitle = d3.select(this.selector).append("div").attr("class", "subtitle-container");
        this.title = d3.select(this.selector).append("div").attr("class", "title-container");
        this.scales = {
            x: d3.scale.linear(),
            y: d3.scale.linear(),
        };
        this.invalidateSize();
    };

    /**
     * Redraws the entire model.
     */
    BaseLayout.prototype.invalidate = function () {
        if (this.model()) {
            this.invalidateTitle();
            this.invalidateSubtitle();
        }
    };

    /**
     * Redraws the title.
     */
    BaseLayout.prototype.invalidateTitle = function () {
        var titleHeight,
            pct = 0.4,
            viewportHeight = $(window).height() - this.padding.top - this.padding.bottom,
            paddingTop = (this.padding.top + (viewportHeight * pct)),
            html = '<div class="title">' + this.model().title + '</div>';
        this.title.html(html);
        console.log("title:" + this.model().title);
        var title = this.title.select(".title");
        title.style("padding-top", (paddingTop - ($(title[0][0]).height() / 2)) + "px");
    };

    /**
     * Redraws the subtitle.
     */
    BaseLayout.prototype.invalidateSubtitle = function () {
        var html = '<div class="subtitle">' + this.model().subtitle + '</div>';
        this.subtitle.html(html);
    };

    /**
     * Adjusts the size of the layout and adjusts the scales.
     */
    BaseLayout.prototype.invalidateSize = function () {
        var width = this.container.width(),
            height = $(window).height() - this.padding.top - this.padding.bottom;

        this.scales.x.domain([0, WIDTH]).range([0, width]);
        this.scales.y.domain([0, HEIGHT]).range([0, height]);

        this.svg.attr("width", width).attr("height", height);

        if (this.model()) {
            this.invalidate();
        }
    };

    return BaseLayout;
});
