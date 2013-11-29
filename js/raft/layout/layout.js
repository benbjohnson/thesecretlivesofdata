
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

define(["../../core/layout/base_layout", "./node_layout", "./client_layout", "./message_layout"], function (BaseLayout, NodeLayout, ClientLayout, MessageLayout) {
    function Layout(selector) {
        BaseLayout.call(this, selector);
        this.nodes = new NodeLayout(this);
        this.clients = new ClientLayout(this);
        this.messages = new MessageLayout(this);
    }

    Layout.prototype = new BaseLayout();
    Layout.prototype.constructor = BaseLayout;

    /**
     * Initializes the layout.
     */
    Layout.prototype.initialize = function () {
        BaseLayout.prototype.initialize.call(this);
        this.messages.g(this.svg.append("g"));
        this.nodes.g(this.svg.append("g"));
        this.clients.g(this.svg.append("g"));
    };

    Layout.prototype.invalidate = function () {
        // Node width, client width, node/client padding.
        var nw = (this.model().nodes.empty() ? 0 : NodeLayout.WIDTH),
            cw = (this.model().clients.empty() ? 0 : ClientLayout.WIDTH),
            ncp = (nw > 0 && cw > 0 ? 10 : 0);

        BaseLayout.prototype.invalidate.call(this);

        this.clients.invalidate(50 - ((nw + ncp + cw) / 2), 0, cw, 100);
        this.nodes.invalidate(50 - ((nw + ncp + cw) / 2) + cw + ncp, 0, nw, 100);
        this.messages.invalidate();
    };

    return Layout;
});
