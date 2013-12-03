
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback*/

define([], function () {
    function Controls(model) {
        var self = this;
        this.model = model;

        this.resume = {
            show: function() {
                self.model.player().pause();
                $(".tsld-resume").css('visibility','visible').hide().fadeIn(600);
            },
            html: function() {
                return '<button type="button" style="visibility:hidden" class="btn btn-default tsld-resume">Continue <span class="glyphicon glyphicon-chevron-right"></span></button>';
            },
        };

        $(document).on("click", ".tsld-resume", function() {
            self.model.player().play();
        });
    }

    return Controls;
});
