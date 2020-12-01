
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
            cluster = function(value) { model().nodes.toArray().forEach(function(node) { node.cluster(value); }); },
            wait = function() { var self = this; model().controls.show(function() { self.stop(); }); },
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; };

        //------------------------------
        // Title
        //------------------------------
        frame.after(1, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            model().title = '<h2 style="visibility:visible">Initial Address Resolution</h1>'
                                + '<br/>' + model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        //------------------------------
        // Initialization
        //------------------------------
        .after(300, function () {
            model().nodeLabelVisible = true;
            model().clients.create("x");
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            model().nodes.create("rr");
            node("rr").type("rr");
            client("x")._url= "neo4j://a.domain.com:7687"
            node("b")._state = "leader";
            node("a")._state = "follower";
            node("c")._state = "follower";
            node("rr").type("rr");
        })

        //------------------------------
        // The problem
        //------------------------------
        .after(1, function () {
            frame.snapshot();
            model().subtitle =  '<h3>We\'ve seen that the client connects to a core instance to retrieve the routing table.</h3>'
                           + '<h2>But what if that server is down?</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            node("a")._state = "stopped";
            node("a")._value = "X";
            layout.invalidate();
        })
        .after(500, function () {
            frame.snapshot();
            model().send(client("x"), node("a"), {type:"Query"});

            layout.invalidate();
        })
        .after(1200, function () {
            model().subtitle =  '<h2>The client can\'t get the routing table. Not very resilient.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        //------------------------------
        // DNS round-robin
        //------------------------------
        .after(100, function () {
            frame.snapshot();
            client("x")._url = "client";
            model().clients.create("dns");
            client("dns")._url = "DNS";
            model().subtitle =  '<h2>There are several ways to improve on that.</h2>'
                        +  '<h2>The first one is <em>DNS round-robin</em>.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            
            client("dns")._log.push(new LogEntry(model(), 1, 1, "cluster.domain.com => IP@ a"));
            client("dns")._log.push(new LogEntry(model(), 2, 1, "cluster.domain.com => IP@ b"));
            client("dns")._log.push(new LogEntry(model(), 3, 1, "cluster.domain.com => IP@ c"));
            client("dns")._url = "DNS";
            
            //layout.invalidate();
           //model().zoom([client("dns"), client("x")]);
            model().subtitle =  '<h3>Set up a DNS name for the whole  cluster with "A records" for each core instance...</h3>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            client("x")._url = "neo4j://cluster.domain.com:7687"; 
            //model().zoom([client("x")]);
            model().subtitle =  '<h3>... and use that name in the client\'s connection URL</h3>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().zoom(null);
            model().subtitle =  '<h2>The DNS resolution will return the IP addresses for all the core instances...</h2>'
                           + model().controls.html();
            model().send(client("x"), client("dns"), {type:"DNS"}, function () {
                model().send(client("dns"), client("x"), {type:"DNS"});
            });
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>... allowing the client, in case of initial failure ...</h2>'
                           + model().controls.html();
            model().send(client("x"), node("a"), {type:"Query"});

            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {

            model().subtitle = '<h2>... to retry with the next address.</h2>'
                           + model().controls.html();
            model().send(client("x"), node("c"), {type:"Query"}, function () {
                model().send(node("c"), client("x"), {type:"Results"}, function () {
                    client("x")._log.push(new LogEntry(model(), 1, 1, "READ=c.domain.com,rr.domain.com"));
                    client("x")._log.push(new LogEntry(model(), 2, 1, "WRITE=b.domain.com"));
                    layout.invalidate();
                })
            });
            layout.invalidate();
        })
        .after(1, wait).indefinite()

        //------------------------------
        // Load balancer
        //------------------------------
        .after(100, function () {
            model().nodeLabelVisible = true;
            model().clear();
            model().clients.create("x");
            model().clients.create("LB"); 
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");  
            client("LB")._url = "LB";
            node("b")._state = "leader";
            node("a")._state = "stopped";
            node("a")._value = "X";
            node("c")._state = "follower"; 
            model().nodes.create("rr");
            node("rr").type("rr");
            layout.invalidate();
        })
        .after(100, function () {
            frame.snapshot();
            model().subtitle =  '<h2>Another option is to use a Load balancer.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(client("LB"), node("a"), {type:"health"});
            model().send(client("LB"), node("b"), {type:"health"}, function () {
                model().send(node("b"), client("LB"), {type:"health_ok"}, function () {
                    node("b")._address = "healthy";
                    layout.invalidate();
                });
            });
            model().send(client("LB"), node("c"), {type:"health"}, function () {
                model().send(node("c"), client("LB"), {type:"health_ok"}, function () {
                    node("c")._address = "healthy";
                    layout.invalidate();
                });
            });
            model().subtitle =  '<h2>The load balancer must be set up to target the core instances, with periodic health checks.</h2>';
            layout.invalidate();
        })
        .after(2000, function () {
            model().send(client("LB"), node("a"), {type:"health"});
            model().send(client("LB"), node("b"), {type:"health"}, function () {
                model().send(node("b"), client("LB"), {type:"health_ok"}, function () {
                    node("b")._address = "healthy";
                    layout.invalidate();
                });
            });
            model().send(client("LB"), node("c"), {type:"health"}, function () {
                model().send(node("c"), client("LB"), {type:"health_ok"}, function () {
                    node("c")._address = "healthy";
                    layout.invalidate();
                });
            });
            layout.invalidate();
        })
       // .after(1, wait).indefinite()
        .after(2000, function () {
            frame.snapshot();
            node("a")._address = "unhealthy";
            model().subtitle =  '<h2>The load balancer must be set up to target the core instances, with periodic health checks.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            client("LB")._url = "lb.domain.com";
            client("x")._url = "neo4j://lb.domain.com:7687";
            model().send(client("x"), client("LB"), {type:"Query"});
            model().subtitle =  '<h2>The client points its connection URL to the Load Balancer</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            client("x")._url = "neo4j://lb.domain.com:7687";
            model().send(client("LB"), node("b"), {type:"Query"}, function () {
                 model().send(node("b"), client("LB"), {type:"Results"}, function () {
                     model().send(client("LB"), client("x"), {type:"Results"}, function () {
                         client("x")._log.push(new LogEntry(model(), 1, 1, "READ=c.domain.com,rr.domain.com"));
                         client("x")._log.push(new LogEntry(model(), 2, 1, "WRITE=b.domain.com"));
                         layout.invalidate();
                     });
                 });
            });
            model().subtitle =  '<h2>The Load Balancer forwards the query to a healthy node, which returns the routing table.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()


        //------------------------------
        // Resolver function
        //------------------------------
        .after(100, function () {
            model().clear();
            layout.invalidate();
        })
        .after(100, function () {
            model().nodeLabelVisible = true;
            frame.snapshot();
            model().clients.create("x");
            client("x")._url = "neo4j://<addressesFromResolverFct>:7687";
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            node("b")._state = "leader";
            node("a")._state = "stopped";
            node("a")._value = "X";
            node("c")._state = "follower";
            model().nodes.create("rr");
            node("rr").type("rr");
            model().subtitle =  '<h2>The last option is to implement a <em>Resolver function</em>, in the client code.</h2>'
                           + '<h5>That function is responsible for returning the addresses of the core instances. It may hardcode them or pull them from an external source.</h5>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();

            model().send(client("x"), node("a"), {type:"Query"});
            model().subtitle =  '<h2>This too allows the client, in case of initial failure...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            frame.snapshot();

            //model().send(client("x"), node("a"), {type:"Query"}, function () {
                model().send(client("x"), node("b"), {type:"Query"}, function () {
                    model().send(node("b"), client("x"), {type:"Results"}, function () {
                        client("x")._log.push(new LogEntry(model(), 1, 1, "READ=c.domain.com,rr.domain.com"));
                        client("x")._log.push(new LogEntry(model(), 2, 1, "WRITE=b.domain.com"));
                        layout.invalidate();
                    })
                })
            //});
            model().subtitle =  '<h2>... to retry with the next address.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()
        .after(100, function () {
            model().nodeLabelVisible = false;
            frame.snapshot();

            model().send(client("x"), node("b"), {type:"Query"}, function () {
                    model().send(node("b"), client("x"), {type:"Results"});
            });
            model().subtitle =  '<h2>Once the routing table is retrieved (in whichever way),</h2>'
                           + '<h2>the client communicates directly with the Neo4j instances using the addresses from the table.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1, wait).indefinite()

        .then(function() {
            player.next();
        })


        player.play();
    };
});
