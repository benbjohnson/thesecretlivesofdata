
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var model  = frame.model(),
            layout = frame.layout();

        model.popover = "INTRO TEXT";
        layout.invalidate();
    };
});
