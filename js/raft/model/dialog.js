
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    function Dialog() {
        this.h1 = this.h2 = this.h3 = this.h4 = this.h5 = [];
        this.align = "center";
        this.valign = "middle";
    }

    /**
     * Returns a list of all header arrays.
     */
    Dialog.prototype.h = function () {
        return [this.h1, this.h2, this.h3, this.h4, this.h5];
    }

    /**
     * Clones the dialog.
     */
    Dialog.prototype.clone = function () {
        var clone = new Dialog();
        clone.h1 = this.h1.slice();
        clone.h2 = this.h2.slice();
        clone.h3 = this.h3.slice();
        clone.h4 = this.h4.slice();
        clone.h5 = this.h5.slice();
        return clone;
    };

    return Dialog;
});
