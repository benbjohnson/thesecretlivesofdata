
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback*/

define(["./node"], function (Node) {
    function Model() {
        this.h1 = this.h2 = this.h3 = this.h4 = this.h5 = [];
        this._nodes = [];
    }

    Model.prototype = playback.model();

    /**
     * Retrieves a node by id.
     */
    Model.prototype.node = function (id) {
        var i;
        for (i = 0; i < this._nodes.length; i += 1) {
            if (this._nodes[i].id === id) {
                return this._nodes[i];
            }
        }
        return null;
    };

    /**
     * Retrieves a list of all nodes.
     */
    Model.prototype.nodes = function () {
        return this._nodes;
    };

    /**
     * Adds a node to the model.
     */
    Model.prototype.addNode = function (node) {
        this._nodes.push(node);
    };

    /**
     * Removes a node from the model.
     */
    Model.prototype.removeNode = function (node) {
        var index = this._nodes.indexOf(node);
        if (index !== -1) {
            this._nodes.splice(index, 1);
        }
    };


    /**
     * Clones the model.
     */
    Model.prototype.clone = function () {
        var i, clone = new Model();
        clone._nodes = this._nodes.map(function (item) { return item.clone(); });
        return clone;
    };

    return Model;
});
