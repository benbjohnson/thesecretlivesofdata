
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback*/

define([], function () {
    function Controls(model) {
        var self = this;
        this.model = model;

        this.show = function() {
            self.model.player().pause();
            self.rollback.show();
            self.resume.show();
        };

        this.html = function() {
            return '<div class="btn-group tsld-btn-group">'
                 + (model.player().current().rollbackable(2) ? self.rollback.html() : "") + self.resume.html()
                 + '</div>';
        };

        this.rollback = {
            show: function() {
                $(".tsld-rollback").css('visibility','visible').hide().fadeIn(600);
            },
            html: function() {
                return '<button type="button" style="visibility:hidden" class="btn btn-default tsld-rollback" alt="Replay previous frame"><span class="glyphicon glyphicon-repeat"></span></button>';
            },
        };

        this.resume = {
            show: function() {
                $(".tsld-resume").css('visibility','visible').hide().fadeIn(600);
            },
            html: function() {
                return '<button type="button" style="visibility:hidden" class="btn btn-default tsld-resume" alt="Continue to next frame">Continue <span class="glyphicon glyphicon-chevron-right"></span></button>';
            },
        };
    }

    return Controls;
});
