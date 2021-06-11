
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../../../bolt/scripts/model/log_entry"], function (LogEntry) {
    return function (frame) {
        var p, p2,
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
            model().clients.create("external");
            model().clients.create("local");
            client("local")._url="local client"; 
            client("external")._url="external client"; 

            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            model().nodes.create("rr");
            node("rr")._type = "rr";
            node("b")._state = "leader";
            node("a")._state = "follower";
            node("c")._state = "follower";
            layout.invalidate();
        })
        .after(100, function () {
            frame.snapshot();
            // p = model().partitions.create("|");
            // p.y1 = Math.min.apply(null, model().nodes.toArray().map(function(node) { return node.y;})) - 20;
            // p.y2 = Math.round((node("a").y + node("b").y) / 2);
            // p.x1 = p.x2 = Math.round((node("a").x + client("csr").x) / 2);
            // p2 = model().partitions.create("-");
            // p2.x1 = Math.round(client("csr").x ) - 20;
            // p2.x2 = Math.round((node("a").x + client("csr").x) / 2);
            // p2.y1 = p2.y2 = Math.round((node("a").y + node("b").y) / 2);
            p = model().partitions.create("/");
            p.y1 = node("a").y - 20;
            p.y2 = client("local").y;
            p.x1 = node("a").x;
            p.x2 = client("local").x - 20;

            model().subtitle = '<h2>Such configuration affects all clients whether they\'re external or local.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().lbs.create("LB-ext");
            lb("LB-ext")._url = "lb.ext";
            lb("LB-ext")._value = "LB";
            model().lbs.create("LB-int");
            lb("LB-int")._url = "lb.int";
            lb("LB-int")._value = "LB";
            layout.invalidate();
            p.y1 = node("a").y - 20;
            p.y2 = client("local").y;
            p.x1 = node("a").x;
            p.x2 = client("local").x - 20;

            client("local")._url="neo4j://lb.int:7687"; 
            client("external")._url="neo4j://lb.ext:7687"; 
            model().send(client("local"), lb("LB-int"), {type:"Query"},  function () {
                model().send(lb("LB-int"), node("b"), {type:"Query"}, function () {
                    model().send(node("b"), lb("LB-int"), {type:"Results"}, function () {   
                        model().send(lb("LB-int"), client("local"), {type:"Results"}, function () {   
                            client("local")._log=[];
                            client("local")._log.push(new LogEntry(model(), 1, "black", "READ=lb.int"));
                            client("local")._log.push(new LogEntry(model(), 2, "black", "WRITE=lb.int"));
                            client("local")._log.push(new LogEntry(model(), 3, "black", "ROUTE=lb.int"));
                            client("local")._value="W";
                            model().send(client("local"), lb("LB-int"), {type:"Query", mode:"W"}, function () {   
                                model().send(lb("LB-int"), node("a"), {type:"Query", mode:"W"}, function () {
                                    model().send(node("a"), node("b"), {type:"Query", mode:"W"}, function () {   
                                        model().send(node("b"), node("a"), {type:"Results"}, function () {   
                                            model().send(node("a"), lb("LB-int"), {type:"Results"}, function () {   
                                                model().send(lb("LB-int"), client("local"), {type:"Results"}, function () {  
                                                    client("local")._log=[];
                                                    client("local")._value="";
                                                    layout.invalidate();
                                                }); 
                                            });
                                        });
                                    });
                                });
                            });
                            layout.invalidate();
                        });
                    });
                 });
            });
            model().subtitle = '<h2>Local clients also get a routing table with only their connection URL address & also use Bolt redirects.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            client("local")._url="client.int"; 
            client("external")._url="client.ext"; 
            client("local")._log=[];
            model().subtitle = '<h2>It is also possible to configure the cluster for hybrid routing supporting both :</h2>'
            + '<h2>• clients using <em>Server-Side</em> Routing</h2>'
            + '<h2>• clients using standard <em>Client-Side</em> Routing</h2>'
            + '<h5>just add exception domains to <em>neo4j.conf</em> : dbms.routing.client_side.enforce_for_domains=*.int</h5>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().lbs.create("LB-ext");
            lb("LB-ext")._url = "lb.ext";
            lb("LB-ext")._value = "LB";
            model().lbs.create("LB-int");
            lb("LB-int")._url = "lb.int";
            lb("LB-int")._value = "LB";
            layout.invalidate();
            p.y1 = node("a").y - 20;
            p.y2 = client("local").y;
            p.x1 = node("a").x;
            p.x2 = client("local").x - 20;

            client("local")._url="neo4j://lb.int:7687"; 
            client("external")._url="neo4j://lb.ext:7687"; 
            model().send(client("local"), lb("LB-int"), {type:"Query"},  function () {
                model().send(lb("LB-int"), node("a"), {type:"Query"}, function () {
                    model().send(node("a"), lb("LB-int"), {type:"Results"}, function () {   
                        model().send(lb("LB-int"), client("local"), {type:"Results"}, function () {   
                            client("local")._log=[];
                            client("local")._log.push(new LogEntry(model(), 1, "black", "READ=a.domain.com,c.domain.com"));
                            client("local")._log.push(new LogEntry(model(), 2, "black", "WRITE=b.domain.com"));
                            client("local")._log.push(new LogEntry(model(), 3, "black", "ROUTE=a.domain.com,b.domain.com,c.domain.com"));
                            client("local")._value="W";
                            model().send(client("local"), node("b"), {type:"Query", mode:"W"}, function () {   
                                model().send(node("b"), client("local"), {type:"Results"}, function () {   
                                    client("local")._log=[];
                                    client("local")._value="";
                                    layout.invalidate();
                                }); 
                            });
                            layout.invalidate();
                        });
                    });
                 });
            });
            model().send(client("external"), lb("LB-ext"), {type:"Query"},  function () {
                model().send(lb("LB-ext"), node("c"), {type:"Query"}, function () {
                    model().send(node("c"), lb("LB-ext"), {type:"Results"}, function () {   
                        model().send(lb("LB-ext"), client("external"), {type:"Results"}, function () {   
                            client("external")._log=[];
                            client("external")._log.push(new LogEntry(model(), 1, "black", "READ=lb.ext"));
                            client("external")._log.push(new LogEntry(model(), 2, "black", "WRITE=lb.ext"));
                            client("external")._log.push(new LogEntry(model(), 3, "black", "ROUTE=lb.ext"));
                            client("external")._value="W";
                            model().send(client("external"), lb("LB-ext"), {type:"Query", mode:"W"}, function () {   
                                model().send(lb("LB-ext"), node("a"), {type:"Query", mode:"W"}, function () {
                                    model().send(node("a"), node("b"), {type:"Query", mode:"W"}, function () {   
                                        model().send(node("b"), node("a"), {type:"Results"}, function () {   
                                            model().send(node("a"), lb("LB-ext"), {type:"Results"}, function () {   
                                                model().send(lb("LB-ext"), client("external"), {type:"Results"}, function () {  
                                                    client("external")._log=[];
                                                    client("external")._value="";
                                                    layout.invalidate();
                                                }); 
                                            });
                                        });
                                    });
                                });
                            });
                            layout.invalidate();
                        });
                    });
                 });
            });
            model().subtitle = ''
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
