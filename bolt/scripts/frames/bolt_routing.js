
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../model/log_entry"], function (LogEntry) {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            wait = function() { var self = this; model().controls.show(function() { player.play(); self.stop(); }); };

        frame.after(1, function() {
            model().nodeLabelVisible = false;
            model().clear();
            layout.invalidate();
        })

        .after(800, function () {
            model().title =  '<h2>The <em>Bolt + Routing</em> protocol</h2>'
                           + '<br/>' + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = true;
            model().clients.create("x");
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            model().nodes.create("rr");
            client("x")._url= "neo4j://a.domain.com:7687"
            node("b")._state = "leader";
            node("a")._state = "follower";
            node("c")._state = "follower";
            node("rr")._type = "rr";
            model().subtitle = '<h2>The client\'s driver is set up with a connection URL using the <em>neo4j://</em> scheme<sup>*</sup>.</h2>'
                            + '<h3>Each Neo4j instance is configured with a <em>dbms.connector.bolt.advertised_address</em></h3>'
                            + '<h5>* <em>neo4j://</em> is the Neo4j 4.x equivalent <em>bolt+routing://</em> in Neo4j 3.x</h5>'
                            + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()

        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = true;
            
            model().send(client("x"), node("a"), {type:"Query"}, function () {
                model().send(node("a"), client("x"), {type:"Results"}, function () {

                    client("x")._log.push(new LogEntry(model(), 1, "black", "READ=a.domain.com,c.domain.com,rr.domain.com"));
                    client("x")._log.push(new LogEntry(model(), 2, "black", "WRITE=b.domain.com"));
                    client("x")._log.push(new LogEntry(model(), 3, "black", "ROUTE=a.domain.com,b.domain.com,c.domain.com"));

                    client("x").dispatchChangeEvent("logChange");
                    layout.invalidate();
                });
                
            } );

            model().subtitle = '<h2>The client sends a query to its URL address, asking for a routing table.</h2>'
                            + model().controls.html();
            layout.invalidate();
        })
        // .at(model(), "logChange", function () {
        //     model().subtitle = model().subtitle + model().controls.html();
        //     layout.invalidate();
        // })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            
            model().subtitle = '<h2>The routing table contains the advertised addresses of the cluster instances, grouped by role :</h2>'
                           + '<h2>WRITE for the leader ; READ for followers and read-replicas<sup>*</sup></h2>'
                           + '<h5>* default config. READ role can be turned on/off for Leader and/or Followers. Fine-grained filters can be applied with <em>server groups</em> & <em>routing policies</em>.</h5>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            
            model().subtitle = '<h2>The ROUTE role is assigned to all core instances.</h2>' 
                    + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().zoom(null);
            client("x")._value="W";
            client("x")._url="";
            model().send(client("x"), node("b"), {type:"Query", mode:"W"}, function () {
                model().send(node("b"), client("x"), {type:"Results"});
            });
            model().subtitle = '<h2>Depending on the <em>Access Mode</em> (Write or Read) selected in the driver session,</h2>'
                           +'<h2>queries are sent to a WRITE instance...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()

        .after(100, function () {
            frame.snapshot();
            client("x")._value="R";
            model().send(client("x"), node("c"), {type:"Query", mode:"R"}, function () {
                model().send(node("c"), client("x"), {type:"Results"});
            });
            model().subtitle = '<h2>... or a READ instance.</h2>'
                           + model().controls.html();
            layout.invalidate();
            client("x")._value="";
        })
        .after(100, wait).indefinite()
        .after(400, function () {
            frame.snapshot();
            model().send(client("x"), node("a"), {type:"Query", mode:"R"}, function () {
                model().send(node("a"), client("x"), {type:"Results"});
            });
            model().subtitle = '<h2>The client also refreshes its routing table periodically<sup>*</sup> against one of the ROUTE instances.</h2>'
                            + '<h5>* every 5 minutes by default, configurable with <em>dbms.routing_ttl</em></h5>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("c")._state = "leader";
            node("b")._state = "follower";
            node("a")._state = "stopped";
            //node("a")._value = "X";
            client("x")._url=""

            model().subtitle = '<h2>If there\'s a change in the cluster during that time, like a node stopping, or a new leader election, the client\'s routing table becomes stale.</h2>'
                           + '<h2>That may cause errors...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(800, wait).indefinite()
        .after(400, function () {
            frame.snapshot();
            client("x")._value="";
            model().send(client("x"), node("a"), {type:"Query", mode:"R"});
            model().subtitle = '<h2>... like an attempt to query a stopped instance.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(400, function () {
            frame.snapshot();
            client("x")._value="";
            client("x")._log=[];
            client("x")._log.push(new LogEntry(model(), 1, "blue", "READ=c.domain.com,rr.domain.com"));
            client("x")._log.push(new LogEntry(model(), 2, "black", "WRITE=b.domain.com"));
            client("x")._log.push(new LogEntry(model(), 3, "blue", "ROUTE=b.domain.com,c.domain.com"));

            model().subtitle = '<h2>In such case, the client will remove the unreachable instance from its curent routing table.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(400, function () {
            frame.snapshot();
            client("x")._value="W";
            model().send(client("x"), node("b"), {type:"Query", mode:"R"}, function () {
                model().send(node("b"), client("x"), {type:"Error"}, function () {
                    client("x")._value="Error";
                    layout.invalidate();
                });
            });
            model().subtitle = '<h2>... or an attempt to write to a READ instance.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(400, function () {
            frame.snapshot();
            client("x")._value="";
            model().send(client("x"), node("b"), {type:"Query", mode:"R"}, function () {
                model().send(node("b"), client("x"), {type:"Results"}, function () {
                    client("x")._log=[];
                    client("x")._log.push(new LogEntry(model(), 1, "blue", "READ=b.domain.com,rr.domain.com"));
                    client("x")._log.push(new LogEntry(model(), 2, "blue", "WRITE=c.domain.com"));
                    client("x")._log.push(new LogEntry(model(), 3, "blue", "ROUTE=b.domain.com,c.domain.com"));
                    layout.invalidate();
                });
            });
            model().subtitle = '<h2>In that case, the client will immediately refresh its routing table.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(1, function () {
            player.next();
        })


        player.play();
    };
});
