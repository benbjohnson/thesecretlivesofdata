
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, tsld, playback*/

define([], function () {
    function Partition(model, id) {
        playback.DataObject.call(this, model);
        this.id = id;
        this.x1 = this.x2 = 0;
        this.y1 = this.y2 = 0;
    }

    Partition.prototype = new playback.DataObject();
    Partition.prototype.constructor = Partition;

    /**
     * Determines the bounding box of the partition.
     */
    Partition.prototype.bbox = function () {
        return tsld.bbox(
            Math.min(this.y1, this.y2),
            Math.max(this.x1, this.x2),
            Math.max(this.y1, this.y2),
            Math.min(this.x1, this.x2)
        );
    };

    Partition.prototype.clone = function (model) {
        var clone = new Partition(model, this.id);
        clone.x1 = this.x1;
        clone.y1 = this.y1;
        clone.x2 = this.x2;
        clone.y2 = this.y2;
        return clone;
    };

    return Partition;
});
