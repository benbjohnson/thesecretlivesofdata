
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
            client("x")._url="client.local"; 
            node("b")._state = "leader";
            node("a")._state = "follower";
            node("c")._state = "follower";
            frame.snapshot();
            layout.invalidate();
        })
        .after(100, function () {
            model().subtitle = '<h2>The <a href="../bolt/index.html">Bolt routing protocol</a> requires <em>direct</em> communication from client to each Neo4j instance.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(800, function () {
            frame.snapshot();
            model().send(client("x"), node("a"), {type:"Query"}, function () {
                model().send(node("a"), client("x"), {type:"Results"});
                layout.invalidate();
            } );
            model().send(client("x"), node("b"), {type:"Query"}, function () {
                model().send(node("b"), client("x"), {type:"Results"});
                layout.invalidate();
            } );
            model().send(client("x"), node("c"), {type:"Query"}, function () {
                model().send(node("c"), client("x"), {type:"Results"});
                layout.invalidate();
            } );

            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            p = model().partitions.create("-");
            p.y1 = Math.min.apply(null, model().nodes.toArray().map(function(node) { return node.y;})) - 10;
            p.y2 = Math.max.apply(null, model().nodes.toArray().map(function(node) { return node.y;})) + 10;
            p.x1 = p.x2 = Math.round((node("a").x + client("x").x) / 2);
            client("x")._url="client.external";
            model().subtitle = '<h2>But what if direct access is impossible?</h2>'
            +'<h2>Clients may indeed reside outside the neo4j cluster\'s network environment.</h2>'
            +'<h5>Examples : <em>Neo4j Browser</em> accessing a remote neo4j cluster over the internet,</h5>'
            +'<h5> a non-kubernetes application accessing a cluster deployed in kubernetes,</h5>'
            +'<h5> a security policy that prohibits direct external exposure of database servers.</h5>'
                           + model().controls.html();
            layout.invalidate();
        })

        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().lbs.create("LB");
            lb("LB")._url = "";
            //p.x1 = Math.round(lb("LB").x);
            
            p.x1 = p.x2 = p.x1 + 1; 
            lb("LB")._value = "LB";
            model().subtitle = '<h2>Access to such a network is usually provided by some kind of Gateway/Load Balancer device...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(lb("LB"), node("a"), {type:"health"}, function () {
                model().send(node("a"), lb("LB"), {type:"health_ok"}, function () {
                    node("a")._address = "healthy";
                    layout.invalidate();
                });
            });
            model().send(lb("LB"), node("b"), {type:"health"}, function () {
                model().send(node("b"), lb("LB"), {type:"health_ok"}, function () {
                    node("b")._address = "healthy";
                    layout.invalidate();
                });
            });
            model().send(lb("LB"), node("c"), {type:"health"}, function () {
                model().send(node("c"), lb("LB"), {type:"health_ok"}, function () {
                    node("c")._address = "healthy";
                    layout.invalidate();
                });
            });
            model().subtitle = '<h2>... that runs periodic health checks against the Neo4j instances.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            
            node("a")._address = "a.domain.com";
            node("b")._address = "b.domain.com";
            node("c")._address = "c.domain.com";
            model().subtitle = '<h2>Server-side routing must be configured on each Neo4j instance : </h2>'
                        +'<h5><em>dbms.routing.enabled=true</em></h5>'
                        +'<h5><em>dbms.routing.default_router=SERVER</em></h5>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()

        .after(100, function () {
            frame.snapshot();
            node("a")._address = "a.domain.com";
            node("b")._address = "b.domain.com";
            node("c")._address = "c.domain.com";
            lb("LB")._url = "lb.ext";
            client("x")._url="neo4j://lb.ext:7687"; 
            model().send(client("x"), lb("LB"), {type:"Query"});
            model().subtitle = '<h2>During the <em>initial address resolution</em> phase, the client connects to the Load Balancer\'s external address...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(lb("LB"), node("a"), {type:"Query"}, function () {
                model().send(node("a"), lb("LB"), {type:"Results"}, function () {   
                    model().send(lb("LB"), client("x"), {type:"Results"}, function () {   
                        client("x")._log=[];
                        client("x")._log.push(new LogEntry(model(), 1, "black", "READ=lb.ext"));
                        client("x")._log.push(new LogEntry(model(), 2, "black", "WRITE=lb.ext"));
                        client("x")._log.push(new LogEntry(model(), 3, "black", "ROUTE=lb.ext"));
                        layout.invalidate();
                    });
                });
             });
            model().subtitle = '<h2>The Load Balancer redirects to one of the healthy servers, which returns a routing table.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            client("x")._log=[];
            client("x")._log.push(new LogEntry(model(), 1, "red", "READ=lb.ext"));
            client("x")._log.push(new LogEntry(model(), 2, "red", "WRITE=lb.ext"));
            client("x")._log.push(new LogEntry(model(), 3, "red", "ROUTE=lb.ext"));

            model().subtitle = '<h2>Instead of the usual advertised addresses, with Server-Side Routing, the routing table only contains the address from the initial connection URL.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            client("x")._log=[];
            client("x")._log.push(new LogEntry(model(), 1, "black", "READ=lb.ext"));
            client("x")._log.push(new LogEntry(model(), 2, "black", "WRITE=lb.ext"));
            client("x")._log.push(new LogEntry(model(), 3, "black", "ROUTE=lb.ext"));
            client("x")._value="R";
            model().send(client("x"), lb("LB"), {type:"Query", mode:"R"});
            model().subtitle = '<h2>It means that, irrespective of the Driver\'s selected <em>Access Mode</em> (Write or Read),</h2>'
                           +'<h2>queries are always sent to the Load Balancer...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(lb("LB"), node("b"), {type:"Query", mode:"R"});
            model().subtitle = '<h2>... which, having no knowledge of instance roles in the clusters,</h2>'
                           +'<h2>simply directs the query to any server according to its own load-balancing policy.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("b"), lb("LB"), {type:"Results"}, function () {   
                    model().send(lb("LB"), client("x"), {type:"Results"}, function () {   
                        layout.invalidate();
                    });
            });

            model().subtitle = '<h2>For READs, which can be served by any instance (including the leader),</h2>'
                           +'<h2>that is not a problem.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            client("x")._value="W";
            model().send(client("x"), lb("LB"), {type:"Query", mode:"W"}, function () {   
                model().send(lb("LB"), node("a"), {type:"Query", mode:"W"});
            });
            model().subtitle = '<h2>WRITEs, on the other hand, must be served by the leader.</h2>'
                           +'<h2>If they end up on a follower or read replica...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), {type:"Query"});
            model().subtitle = '<h2>... the query is automatically redirected towards the leader.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("b"), node("a"), {type:"Results"}, function () {   
                model().send(node("a"), lb("LB"), {type:"Results"}, function () {   
                    model().send(lb("LB"), client("x"), {type:"Results"}, function () {   
                        layout.invalidate();
                    });
                });
            });
            model().subtitle = '<h2>...</h2>'
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
