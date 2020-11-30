
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
            model().nodeLabelVisible = true;
            model().clear();
            model().clients.create("x");
            client("x")._url="client";
            model().nodes.create("a");
            node("a")._address="Neo4j instance";
            layout.invalidate();
        })

        .after(800, function () {
            model().subtitle = '<h2><em>Bolt</em> is a protocol for communication between a client & a Neo4j DBMS.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().send(client("x"), node("a"), {type:"Query"}, function () {
                model().send(node("a"), client("x"), {type:"Results"});
                layout.invalidate();
            } );
            model().subtitle = '<h2>For a standalone Neo4j instance, no routing is required : </h2>'
            +'<h2>the client just sends <em><span style="color:indigo;">queries</span></em> to the server  & the server returns <em><span style="color:cyan;">results</span></em>.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })

        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().nodeLabelVisible = false;
            model().nodes.create("b");
            model().nodes.create("c");
            node("b")._state = "follower";
            model().subtitle = '<h2>But with a Neo4j cluster, things are more complicated.</h2>'
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
            model().subtitle = '<h2>... & send reads & writes to the correct ones.</h2>' 
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
            model().zoom([node("a"), node("b"), node("c")]);
            model().subtitle = '<h2>And cluster instances can change role over time...</h2>'
               + model().controls.html();
            layout.invalidate();
        })
        .after(1200, function () {
            node("b")._state = "follower";
            node("a")._state = "leader";

            layout.invalidate();
        })
        .after(1200, function () {
            node("c")._state = "stopped";
            model().subtitle = '<h2>And cluster instances can change role over time... or stop.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().zoom(null);
            node("a")._address="Leader";
            node("b")._address="Follower";
            node("c")._address="Stopped";
            node("rr1")._address="RR";
            node("rr2")._address="RR";
            model().nodeLabelVisible = true;
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
