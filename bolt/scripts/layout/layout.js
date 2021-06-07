
"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback, tsld*/

define(["./node_layout", "./client_layout", "./message_layout", "./partition_layout", "./lb_layout"], function (NodeLayout, ClientLayout, MessageLayout, PartitionLayout, LbLayout) {
    function Layout(selector) {
        tsld.Layout.call(this, selector);
        this.nodes = new NodeLayout(this);
        this.clients = new ClientLayout(this);
        this.messages = new MessageLayout(this);
        this.partitions = new PartitionLayout(this);
        this.lbs = new LbLayout(this);
    }

    Layout.prototype = new tsld.Layout();
    Layout.prototype.constructor = Layout;

    /**
     * Initializes the layout.
     */
    Layout.prototype.initialize = function () {
        tsld.Layout.prototype.initialize.call(this);
        this.messages.g(this.g.append("g"));
        this.nodes.g(this.g.append("g"));
        this.clients.g(this.g.append("g"));
        this.partitions.g(this.g.append("g"));
        this.lbs.g(this.g.append("g"));
    };

    Layout.prototype.invalidate = function () {
        // Node width, client width, node/client padding.
        var ncp, ncp2,
            nw = 0,
            cw = (this.model().clients.empty() ? 0 : ClientLayout.WIDTH),
            lbw = (this.model().lbs.empty() ? 0 : LbLayout.WIDTH);

        // 1- and 2-node clusters are vertical so shrink their size.
        if (this.model().nodes.size() > 2) {
            nw = NodeLayout.WIDTH;
        } else if (this.model().nodes.size() > 0) {
            nw = NodeLayout.WIDTH / 2;
        }


        ncp = (cw > 0 && (lbw > 0 || nw > 0) ? 20 : 0);
        ncp2 = (lbw > 0  && nw > 0 ? 20 : 0);

        tsld.Layout.prototype.invalidate.call(this);
        var total_w = cw + ncp + lbw + ncp2 + nw;

        this.clients.invalidate(50 - (total_w / 2), 0, cw, 100);
        this.lbs.invalidate(50 - (total_w / 2)+ cw + ncp, 0, lbw, 100);
        this.nodes.invalidate(50 - (total_w / 2) + cw + ncp + lbw + ncp2, 0, nw, 100);
        this.messages.invalidate();
        this.partitions.invalidate();

    };

    return Layout;
});
