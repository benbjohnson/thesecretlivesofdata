
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define([], function () {
    var PAD = 5;

    function BaseLayout(selector) {
        this.selector = selector;
        this.prevTitle = this.prevSubtitle = "";
        this.padding = {
            top: 70,
            bottom: 160,
            left: 0,
            right: 0,
        };
    }

    BaseLayout.prototype = playback.layout();

    /**
     * Initializes the layout.
     */
    BaseLayout.prototype.initialize = function () {
        var self = this;
        this.container = $(this.selector);
        this.svg = d3.select(this.selector).append("svg");
        this.g = this.svg.append("g");
        this.title = d3.select(this.selector).append("div").attr("class", "container title-container").style("display", "none");
        this.subtitle = d3.select(this.selector).append("div").attr("class", "container subtitle-container");

        this.scales = {
            x: d3.scale.linear(),
            y: d3.scale.linear(),
            w: d3.scale.linear(),
            h: d3.scale.linear(),
            r: function(v) { return Math.min(self.scales.w(v), self.scales.h(v)); },
            font: function(v) { return Math.min(self.scales.font.x(v), self.scales.font.y(v)); },
        };
        this.scales.font.x = d3.scale.linear();
        this.scales.font.y = d3.scale.linear();

        this.invalidateSize();
    };

    /**
     * Redraws the entire model.
     */
    BaseLayout.prototype.invalidate = function () {
        var model = this.model(),
            width = this.container.width(),
            height = $(window).height() - this.padding.top - this.padding.bottom,
            viewport = {
                width: width - (PAD * 2),
                height: height - (PAD * 2),
            };

        this.svg.attr("width", width).attr("height", height);
        this.g.attr("transform", "translate(" + PAD + "," + PAD + ")");

        if (model) {
            var zoom = {
                x:((model.domains.x[1] - model.domains.x[0]) / 100),
                y:((model.domains.y[1] - model.domains.y[0]) / 100),
            };
            this.scales.x.domain(model.domains.x).range([0, viewport.width]);
            this.scales.y.domain(model.domains.y).range([0, viewport.height]);
            this.scales.w.domain([0, model.domains.x[1] - model.domains.x[0]]).range([0, viewport.width]);
            this.scales.h.domain([0, model.domains.y[1] - model.domains.y[0]]).range([0, viewport.height]);
            this.scales.font.x.domain([0, 100 * zoom.x]).range([0, viewport.width * 0.17]);
            this.scales.font.y.domain([0, 100 * zoom.y]).range([0, viewport.height * 0.4]);

            this.invalidateTitle();
            this.invalidateSubtitle();
        }
    };

    /**
     * Redraws the title.
     */
    BaseLayout.prototype.invalidateTitle = function () {
        var titleHeight,
            self = this,
            pct = 0.4,
            viewportHeight = $(window).height() - this.padding.top - this.padding.bottom,
            top = (this.padding.top + (viewportHeight * pct)),
            title = this.model().title,
            html = '<div class="title">' + title + '</div>';

        if (this.prevTitle !== title) {
            // Fade title in.
            if(this.prevTitle === "" && title !== "") {
                this.title.style("display", "block");
                this.title.html(html);
                this.fadeIn($(this.title[0][0]));
            }
            // Fade title out.
            else if(this.prevTitle !== "" && title === "") {
                this.fadeOut($(this.title[0][0]), function() {
                    self.title.html(html);
                    self.title.style("display", "none");
                });
            }
            // Update title.
            else {
                this.title.html(html);
            }

            this.prevTitle = title;
        }

        var title = this.title.select(".title");
        title.style("top", (top - ($(title[0][0]).height() / 2)) + "px");
    };

    /**
     * Redraws the subtitle.
     */
    BaseLayout.prototype.invalidateSubtitle = function () {
        var self = this,
            text = this.model().subtitle,
            html = '<div class="subtitle">' + text + '</div>';

        if (this.prevSubtitle !== text) {
            // Fade in.
            if(this.prevSubtitle === "" && text !== "") {
                this.subtitle.style("display", "block");
                this.subtitle.html(html);
                this.fadeIn($(this.subtitle[0][0]));
            }
            // Fade out.
            else if(this.prevSubtitle !== "" && text === "") {
                this.fadeOut($(this.subtitle[0][0]));
            }
            // Update subtitle.
            else {
                this.subtitle.html(html);
            }

            this.prevSubtitle = text;
        }
    };

    /**
     * Adjusts the size of the layout and adjusts the scales.
     */
    BaseLayout.prototype.invalidateSize = function () {
        if (this.model()) {
            this.invalidate();
        }
    };

    /**
     * A helper function to fade in an element.
     */
    BaseLayout.prototype.fadeIn = function (el) {
        return el.css('visibility','visible').hide().fadeIn(600);
    };

    /**
     * A helper function to fade out an element.
     */
    BaseLayout.prototype.fadeOut = function (el, complete) {
        return el.css('visibility','hidden').fadeOut(600, complete);
    };

    return BaseLayout;
});
