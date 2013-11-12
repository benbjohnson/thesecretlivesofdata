
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, d3, playback*/

define(["./model", "./node", "../domReady!"], function (Model, Node, doc) {
    var player = playback.player(),
        container = $("#chart"),
        svg = d3.select("#chart").append("svg"),
        g   = svg.append("g"),
        scales = {
            x: d3.scale.linear(),
            y: d3.scale.linear(),
        };

    player.model(new Model());

    player.frame(function(frame) { 
        var model = frame.model();
        model.addNode(new Node("A"));
        model.addNode(new Node("B"));
        model.addNode(new Node("C"));
        model.addNode(new Node("C"));
        model.addNode(new Node("C"));
    });

    player.onupdate(function() {
        var frame = player.current(),
            model = frame.model(),
            w = $("#chart").width(),
            h = 500;

        svg.attr("width", w).attr("height", h);
        scales.x.domain([0, model.width]).range([0, w]);
        scales.y.domain([0, model.height]).range([0, h]);

        g.selectAll(".node").data(model.nodes)
            .call(function() {
                this.enter().append("circle")
                    .attr("class", "node")
                    .style("fill", "steelblue")
                ;

                this
                    .attr("r", function(d) { return d.radius})
                    .attr("cx", function(d) { return scales.x(d.x); })
                    .attr("cy", function(d) { return scales.y(d.y); })
                ;
            });
    });

    player.play();
});
