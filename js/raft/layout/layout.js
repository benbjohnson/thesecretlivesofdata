
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["../../core/layout/base_layout", "./node_layout", "./client_layout"], function (BaseLayout, NodeLayout, ClientLayout) {
    function Layout(selector) {
        BaseLayout.call(this, selector);
        this.nodes = new NodeLayout(this);
        this.clients = new ClientLayout(this);
    }

    Layout.prototype = new BaseLayout();
    Layout.prototype.constructor = BaseLayout;

    /**
     * Initializes the layout.
     */
    Layout.prototype.initialize = function () {
        BaseLayout.prototype.initialize.call(this);
        this.nodes.g(this.svg.append("g"));
        this.clients.g(this.svg.append("g"));
    };

    Layout.prototype.invalidate = function () {
        var cw = (this.model().clients.empty() ? 0 : 10);
        BaseLayout.prototype.invalidate.call(this);
        this.clients.invalidate(0, 0, cw, 100);
        this.nodes.invalidate(cw, 0, 100, 100);
    };

    return Layout;
});
