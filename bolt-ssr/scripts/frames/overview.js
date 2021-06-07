
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../../../bolt/scripts//model/log_entry"], function (LogEntry) {
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
            client("x")._url="client.local";
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            node("b")._state = "leader";
            node("a")._state = "follower";
            node("c")._state = "follower";
            layout.invalidate();
        })

        .after(800, function () {
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
            model().subtitle = '<h2>The <a href="../bolt/index.html">Bolt routing protocol</a> requires <em>direct</em> communication from client to each Neo4j instance.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            //model().nodeLabelVisible = false;
            p = model().partitions.create("-");
            p.y1 = Math.min.apply(null, model().nodes.toArray().map(function(node) { return node.y;})) - 10;
            p.y2 = Math.max.apply(null, model().nodes.toArray().map(function(node) { return node.y;})) + 10;
            p.x1 = p.x2 = Math.round(node("a").x + client("x").x) / 2;
            client("x")._url="client.external";
            model().subtitle = '<h2>But what if direct access is impossible?</h2>'
            +'<h2>Clients may reside outside the neo4j cluster network environment.</h2>'
            +'<h5>Ex : <em>Neo4j Browser</em> accessing a remote neo4j cluster over the internet,'
            +' a non-kubernetes application accessing a cluster deployed in kubernetes,'
            +' a security policy that prohibits direct external exposure of database servers.</h5>'
                           + model().controls.html();
            layout.invalidate();
        })

        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().lbs.create("LB");
            //p.x1 = Math.round(lb("LB").x);
            
            p.x1 = p.x2 = Math.round(node("b").x + client("x").x) / 2;
            lb("LB")._value = "LB";
            lb("LB")._url = "lb.external";
            model().send(client("x"), lb("LB"), {type:"Query"}, function () {
                model().send(lb("LB"), node("a"), {type:"Query"}, function () {
                    model().send(node("a"), lb("LB"), {type:"Results"}, function () {   
                        model().send(lb("LB"), client("x"), {type:"Results"}, function () {   
                            layout.invalidate();
                        });
                    });
                });
            } );
            model().subtitle = '<h2>Access to such a network is usually provided by some kind of gateway/load balancer device.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().zoom([node("a"),node("b"),node("c")]);
            node("b")._state = "leader";
            model().subtitle = '<h2>A Neo4j Causal Cluster implements the <em>Raft</em> protocol.</h2>'
                        + '<h2>Each Neo4j database has its own Raft group...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().zoom([node("b")]);
            model().subtitle = '<h2>in which, one of the core instances is a <em>Leader</em>, that must process all the write queries...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().zoom([node("a"),node("c")]);
            node("a")._state = "follower";
            node("c")._state = "follower";
            model().subtitle = '<h2>... and the rest are <em>Followers</em>, that can only process reads.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().zoom([node("a"),node("b"),node("c")]);
            node("a")._address="";
            node("b")._address="";
            node("c")._address="";
            client("x")._url="";
            model().subtitle = '<h2>Read replicas can also be added to the cluster to scale out reads.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            
            model().nodes.create("rr1");
            model().nodes.create("rr2");
            node("rr1").type("rr");
            node("rr2").type("rr");
            node("rr1")._address="RR";
            node("rr2")._address="RR";
            model().nodeLabelVisible = true;
            model().zoom(null);//[node("a"),node("b"),node("c"),node("rr1"),node("rr2")]);
            model().subtitle = '<h2>The client must discover all those instances...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(300, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().zoom(null);

            // const instances = ["a", "b", "c", "rr1", "rr2"];
            // instances.forEach(function (item, index) {
            //     model().send(client("x"), node(item), {type:"Query"}, function () {
            //           model().send(node(item), client("x"), {type:"Results"}); 
            //     });
            // });
            model().subtitle = '<h2>... & be able to send reads & writes to the correct ones.</h2>' 
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            var item="a";
            model().send(client("x"), node(item), {type:"Query"}, function () {
                  model().send(node(item), client("x"), {type:"Results"}); 
            });
        })
        .after(300, function () {
            var item="b";
            model().send(client("x"), node(item), {type:"Query"}, function () {
                  model().send(node(item), client("x"), {type:"Results"}); 
            });
        })  
        .after(100, function () {
            var item="c";
            model().send(client("x"), node(item), {type:"Query"}, function () {
                  model().send(node(item), client("x"), {type:"Results"}); 
            });
        })    
        .after(200, function () {
            var item="rr1";
            model().send(client("x"), node(item), {type:"Query"}, function () {
                  model().send(node(item), client("x"), {type:"Results"}); 
            });
        })    
        .after(50, function () {
            var item="rr2";
            model().send(client("x"), node(item), {type:"Query"}, function () {
                  model().send(node(item), client("x"), {type:"Results"}); 
            });
        })  
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().zoom(null);
            model().subtitle = '<h2>On top of that, cluster instances can change role over time...</h2>';
         
            layout.invalidate();
        })
        .after(1200, function () {
            node("b")._state = "follower";
            node("a")._state = "leader";
            node("a")._address="new leader";
            node("b")._address="";
            node("c")._address="";
            node("rr1")._address="";
            node("rr2")._address="";
            model().nodeLabelVisible = true;
            layout.invalidate();
        })
        .after(1200, function () {
            node("c")._state = "stopped";
            node("c")._address="stopped";
            model().subtitle = model().subtitle+ '<h2>some may get stopped...</h2>';
            layout.invalidate();
        })
        .after(1200, function () {
            model().nodes.create("d");
            node("d")._state = "follower";
            node("d")._address="new joiner";
            layout.invalidate();
            //model().zoom([node("a"), node("b"), node("c"), node("d")]);
            model().subtitle = model().subtitle+ '<h2> & some new ones may join.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().zoom(null);
            node("a")._address="";
            node("b")._address="";
            node("c")._address="";
            node("d")._address="";
            node("rr1")._address="";
            node("rr2")._address="";
            model().subtitle =  '<h2>Enters the bolt+routing protocol!</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(30, function () {
            frame.snapshot();
            player.next();
        })


        player.play();
    };
});
