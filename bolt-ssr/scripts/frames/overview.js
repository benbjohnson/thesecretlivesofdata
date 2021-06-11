
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../../../bolt/scripts/model/log_entry"], function (LogEntry) {
    return function (frame) {
        var p,
            player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            lb = function(id) { return frame.model().lbs.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            partition = function(id) { return frame.model().partitions.find(id); },
            wait = function() { var self = this; model().controls.show(function() { player.play(); self.stop(); }); };

        frame.after(1, function() {
            model().nodeLabelVisible = true;
            model().clear();
            model().clients.create("x");

            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            model().nodes.create("rr");
            client("x")._url="client.local"; 
            node("b")._state = "leader";
            node("a")._state = "follower";
            node("c")._state = "follower";
            node("b")._address = "leader";
            node("a")._address = "follower";
            node("c")._address = "follower";
            node("rr")._address = "read replica";
            node("rr")._type = "rr";
            frame.snapshot();
            layout.invalidate();
        })
        .after(100, function () {
            model().subtitle = '<h2>The <a href="../bolt/index.html">Bolt routing protocol</a> requires <em>direct</em> communication from client to each Neo4j instance.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            frame.snapshot();
            var servers=["a", "b", "c", "rr"];
            for (let i=0; i < servers.length; i++ ) {
                model().send(client("x"), node(servers[i]), {type:"Query"}, function () {
                    model().send(node(servers[i]), client("x"), {type:"Results"});
                    layout.invalidate();
                } );
            }
            layout.invalidate();
        })
        .after(100, wait).indefinite()

        .after(100, function () {
            frame.snapshot();
            p = model().partitions.create("-");
            p.y1 = Math.min.apply(null, model().nodes.toArray().map(function(node) { return node.y;})) - 20;
            p.y2 = Math.max.apply(null, model().nodes.toArray().map(function(node) { return node.y;})) + 20;
            p.x1 = p.x2 = Math.round((node("a").x + client("x").x) / 2);
            client("x")._url="client.external";
            model().subtitle = '<h2>But what if direct access is impossible?</h2>'
            +'<h2>Clients may indeed reside outside the neo4j cluster\'s network environment.</h2>'
            +'<h5>Examples :</h5><h5> • <em>Neo4j Browser</em> accessing a remote neo4j cluster over the internet,</h5>'
            +'<h5> • a non-kubernetes application accessing a cluster deployed in kubernetes,</h5>'
            +'<h5> • a security policy that prohibits direct external exposure of database servers.</h5>'
                           + model().controls.html();
            layout.invalidate();
        })

        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();

            model().subtitle = '<h2>To help with such scenarios, Neo4j 4.3 introduces <em>Server-Side Routing</em>.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(30, function () {
            frame.snapshot();
            player.next();
        });


        player.play();
    };
});
