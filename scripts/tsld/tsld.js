;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("tsld/scripts/bbox.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

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

    if (this.top === undefined) {
        top = b.top;
    } else if (b.top === undefined) {
        top = this.top;
    } else {
        top    = Math.min(this.top, b.top);
    }

    if (this.right === undefined) {
        right = b.right;
    } else if (b.right === undefined) {
        right = this.right;
    } else {
        right  = Math.max(this.right, b.right);
    }

    if (this.bottom === undefined) {
        bottom = b.bottom;
    } else if (b.bottom === undefined) {
        bottom = this.bottom;
    } else {
        bottom = Math.max(this.bottom, b.bottom);
    }

    if (this.left === undefined) {
        left = b.left;
    } else if (b.left === undefined) {
        left = this.left;
    } else {
        left   = Math.min(this.left, b.left);
    }

    return new BBox(top, right, bottom, left);
};

module.exports = BBox;

});
require.register("tsld/scripts/layout.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/
/*global $, define, d3, playback*/

var PAD = 5;

function Layout(selector) {
    playback.Layout.call(this);
    this.selector = selector;
    this.prevTitle = this.prevSubtitle = "";
    this.padding = {
        top: 70,
        bottom: 160,
        left: 0,
        right: 0,
    };
    this.containerClass = "container";
}

Layout.prototype = new playback.Layout();

/**
 * Initializes the layout.
 */
Layout.prototype.initialize = function () {
    var self = this;
    this.container = $(this.selector);
    this.svg = d3.select(this.selector).append("svg").attr("class", "tsld");
    this.g = this.svg.append("g").attr("class", "tsld");
    this.titleContainer = d3.select(this.selector).append("div").attr("class", "tsld title-container " + this.containerClass).style("display", "none");
    this.subtitleContainer = d3.select(this.selector).append("div").attr("class", "tsld subtitle-container " + this.containerClass);

    this.scales = {
        x: d3.scale.linear(),
        y: d3.scale.linear(),
        w: d3.scale.linear(),
        h: d3.scale.linear(),
        r: function (v) { return Math.min(self.scales.w(v), self.scales.h(v)); },
        font: function (v) { return Math.min(self.scales.font.x(v), self.scales.font.y(v)); },
        size: function (v) { return Math.min(self.scales.w(v), self.scales.h(v)); },
    };
    this.scales.font.x = d3.scale.linear();
    this.scales.font.y = d3.scale.linear();

    this.invalidateSize();
};

/**
 * Redraws the entire model.
 */
Layout.prototype.invalidate = function () {
    var zoom,
        model = this.model(),
        width = this.container.width(),
        height = $(window).height() - this.padding.top - this.padding.bottom,
        viewport = {
            width: width - (PAD * 2),
            height: height - (PAD * 2),
        };

    this.svg.attr("width", width).attr("height", height);
    this.g.attr("transform", "translate(" + PAD + "," + PAD + ")");

    if (model) {
        zoom = {
            x: ((model.domains.x[1] - model.domains.x[0]) / 100),
            y: ((model.domains.y[1] - model.domains.y[0]) / 100),
        };
        this.scales.x.domain(model.domains.x).range([0, viewport.width]);
        this.scales.y.domain(model.domains.y).range([0, viewport.height]);
        this.scales.w.domain([0, model.domains.x[1] - model.domains.x[0]]).range([0, viewport.width]);
        this.scales.h.domain([0, model.domains.y[1] - model.domains.y[0]]).range([0, viewport.height]);
        this.scales.font.x.domain([0, 100 * zoom.x]).range([0, viewport.width * 0.35]);
        this.scales.font.y.domain([0, 100 * zoom.y]).range([0, viewport.height * 0.4]);

        this.invalidateTitle();
        this.invalidateSubtitle();
    }
};

/**
 * Redraws the title.
 */
Layout.prototype.invalidateTitle = function () {
    var titleHTML, titleHeight,
        self = this,
        pct = 0.4,
        viewportHeight = $(window).height() - this.padding.top - this.padding.bottom,
        top = (this.padding.top + (viewportHeight * pct)),
        title = this.model().title,
        html = '<div class="title">' + title + '</div>';

    if (this.prevTitle !== title) {
        if (this.prevTitle === "" && title !== "") {
            // Fade title in.
            this.titleContainer.style("display", "block");
            this.titleContainer.html(html);
            this.fadeIn($(this.titleContainer[0][0]));
        } else if (this.prevTitle !== "" && title === "") {
            // Fade title out.
            this.fadeOut($(this.titleContainer[0][0]), function () {
                self.titleContainer.html(html);
                self.titleContainer.style("display", "none");
            });
        } else {
            // Update title.
            this.titleContainer.html(html);
        }

        this.prevTitle = title;
    }

    titleHTML = this.titleContainer.select(".title");
    titleHTML.style("top", (top - ($(titleHTML[0][0]).height() / 2)) + "px");
};

/**
 * Redraws the subtitle.
 */
Layout.prototype.invalidateSubtitle = function () {
    var self = this,
        text = this.model().subtitle,
        html = '<div class="subtitle">' + text + '</div>';

    if (this.prevSubtitle !== text) {
        if (this.prevSubtitle === "" && text !== "") {
            // Fade in.
            this.subtitleContainer.style("display", "block");
            this.subtitleContainer.html(html);
            this.fadeIn($(this.subtitleContainer[0][0]));
        } else if (this.prevSubtitle !== "" && text === "") {
            // Fade out.
            this.fadeOut($(this.subtitleContainer[0][0]));
        } else {
            // Update subtitle.
            this.subtitleContainer.html(html);
        }

        this.prevSubtitle = text;
    }
};

/**
 * Adjusts the size of the layout and adjusts the scales.
 */
Layout.prototype.invalidateSize = function () {
    if (this.model()) {
        this.invalidate();
    }
};

/**
 * A helper function to fade in an element.
 */
Layout.prototype.fadeIn = function (el) {
    return el.css('visibility', 'visible').hide().fadeIn(600);
};

/**
 * A helper function to fade out an element.
 */
Layout.prototype.fadeOut = function (el, complete) {
    return el.css('visibility', 'hidden').fadeOut(600, complete);
};

module.exports = Layout;

});
require.register("tsld/scripts/index.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var Tsld = require('./tsld');

module.exports = new Tsld();

});
require.register("tsld/scripts/tsld.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var BBox = require('./bbox'),
    Layout = require('./layout');

function Tsld() {
}

Tsld.prototype.BBox = BBox;

Tsld.prototype.bbox = function (top, right, bottom, left) {
    return new BBox(top, right, bottom, left);
};

Tsld.prototype.Layout = Layout;


module.exports = Tsld;

Tsld.VERSION = Tsld.prototype.VERSION = '0.1.0';


});
require.alias("tsld/scripts/index.js", "tsld/index.js");if (typeof exports == "object") {
  module.exports = require("tsld");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("tsld"); });
} else {
  this["tsld"] = require("tsld");
}})();