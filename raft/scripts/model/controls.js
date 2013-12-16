
"use strict";
/*jslint browser: true, nomen: true*/
/*global define, playback*/

define([], function () {
    function Controls(model) {
        var self = this;
        this.model = model;
        this.callback = null;

        this.show = function(callback) {
            this.callback = (callback !== undefined ? callback : null);
            if (this.callback === null) {
                self.model.player().pause();
            }
            self.rollback.show();
            self.resume.show();
        };

        this.html = function() {
            return '<div class="btn-group">'
                 + (model.player().current().rollbackable(2) ? self.rollback.html() : "") + self.resume.html()
                 + '</div>';
        };

        this.rollback = {
            show: function() {
                $(".btn.rollback").css('visibility','visible').hide().fadeIn(600);
            },
            html: function() {
                return '<button type="button" style="visibility:hidden" class="btn btn-default rollback" alt="Replay previous frame"><span class="glyphicon glyphicon-repeat"></span></button>';
            },
            click: function() {
                model.player().current().rollback(2);
                model.player().layout().invalidate();
                model.player().play();
            },
        };

        this.resume = {
            show: function() {
                $(".btn.resume").css('visibility','visible').hide().fadeIn(600);
            },
            html: function() {
                return '<button type="button" style="visibility:hidden" class="btn btn-default resume" alt="Continue to next frame">Continue <span class="glyphicon glyphicon-chevron-right"></span></button>';
            },
            click: function() {
                if (self.callback !== null) {
                    self.callback();
                    self.callback = null;
                } else {
                    model.player().play();
                }
            },
        };
    }

    return Controls;
});
