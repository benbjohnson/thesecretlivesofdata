
"use strict";
/*jslint browser: true, nomen: true*/

define([], function () {
    function BBox(top, right, bottom, left) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    /**
     * Determines if two bboxes are equal.
     */
    BBox.prototype.equal = function (b) {
        if (b === null || b === undefined) {
            return false;
        }
        return this.top === b.top
            && this.right === b.right
            && this.bottom === b.bottom
            && this.left === b.left;
    };

    /**
     * The smallest bounding box containing this bounding box and another.
     */
    BBox.prototype.union = function (b) {
        var top, right, bottom, left;

        if (b === null) {
            return this;
        }

        top    = Math.min(this.top, b.top),
        right  = Math.max(this.right, b.right),
        bottom = Math.max(this.bottom, b.bottom),
        left   = Math.min(this.left, b.left);
        return new BBox(top, right, bottom, left);
    };

    return BBox;
});
