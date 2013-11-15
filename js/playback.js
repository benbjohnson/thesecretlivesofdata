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
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("ianstormtaylor-is-empty/index.js", function(exports, require, module){

/**
 * Expose `isEmpty`.
 */

module.exports = isEmpty;


/**
 * Has.
 */

var has = Object.prototype.hasOwnProperty;


/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty (val) {
  if (null == val) return true;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}
});
require.register("ianstormtaylor-is/index.js", function(exports, require, module){

var isEmpty = require('is-empty')
  , typeOf = require('type');


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("juliangruber-events/index.js", function(exports, require, module){
var Emitter = require('emitter');

// alias all the things!
Emitter.prototype.addListener = Emitter.prototype.on;
Emitter.prototype.removeListener = Emitter.prototype.off;
Emitter.prototype.removeAllListeners = Emitter.prototype.off;

Emitter.prototype.setMaxListeners = function(){ /* noop */ };

exports.EventEmitter = Emitter;

});
require.register("juliangruber-periodic/index.js", function(exports, require, module){
var EventEmitter = require('events').EventEmitter;

module.exports = periodic;

function periodic (interval) {
  if (!(this instanceof periodic)) return new periodic(interval);
  EventEmitter.call(this);

  this.interval = interval;
  this.ended = false;
  this.timeout;

  var self = this;
  setTimeout(function () {
    self.repeat();
  });
}

inherits(periodic, EventEmitter);

periodic.prototype.repeat = function () {
  if (this.ended) return;

  var start = +new Date();
  var tick = 0;

  var dt = (start + this.interval * ++tick) - +new Date();
  if (dt < 0) dt = 0;

  var self = this;
  self.timeout = setTimeout(function () {
    self.repeat();
  }, dt);

  this.emit('tick');
}

periodic.prototype.end = function () {
  this.ended = true;
  if (this.timeout) clearTimeout(this.timeout);
}

function inherits (a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};

});
require.register("timoxley-next-tick/index.js", function(exports, require, module){
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

});
require.register("playback/lib/ease.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

function ease(name) {
    switch (name) {
    case "linear":
        return ease.linear;
    }
}

function linear(t) {
    return t;
}

ease.linear = linear;

module.exports = ease;

});
require.register("playback/lib/index.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var Playback = require('./playback');

module.exports = new Playback();

});
require.register("playback/lib/frame.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var Timer = require('./timer'),
    Tween = require('./tween'),
    is    = require('is');

/**
 * Initializes a new Frame instance.
 */
function Frame(fn) {
    if (!is.fn(fn)) {
        throw "Frame function required";
    }
    this._fn = fn;
    this._player = null;
    this._onend = null;
    this._playhead = 0;
    this._duration = 0;
    this._model = null;
    this._timers = [];
    this._tweens = [];
}

/**
 * Initializes the frame by reseting the playhead to zero and executing
 * the frame function.
 *
 * @return {Frame}
 */
Frame.prototype.init = function () {
    this.reset();
    this._fn.call(this, this);
    return this;
};

/**
 * Stops the frame and executes the "onend" handler.
 *
 * @return {Frame}
 */
Frame.prototype.end = function () {
    this.reset();
    if (is.fn(this._onend)) {
        this._onend.call(this, this);
    }
    return this;
};

/**
 * Sets or retrieves the player this frame belongs to.
 *
 * @return {Frame|Player}
 */
Frame.prototype.player = function (value) {
    if (arguments.length === 0) {
        return this._player;
    }
    this._player = value;
    return this;
};

/**
 * Sets or retrieves the current playhead position. This is the
 * time elapsed in milliseconds for the frame.
 *
 * @return {Boolean}
 */
Frame.prototype.playhead = function (value) {
    var self = this, i, timer, timers, tween, tweens;
    if (arguments.length === 0) {
        return this._playhead;
    }
    if (this._playhead >= value) {
        return this;
    }

    // Execute timers between previous playhead position and current.
    this._playhead += 1;
    while (true) {
        timers = this.timers();
        if (timers.length === 0) {
            break;
        }

        // Find next playhead position.
        this._playhead = timers[0].until(this._playhead);
        if (this._playhead > value) {
            break;
        }
        this._duration = Math.max(this._duration, this._playhead);

        // Run all timers at that position.
        for (i = 0; i < timers.length; i += 1) {
            timer = timers[i];
            if (i > 0 && timer.until(this._playhead) !== this._playhead) {
                break;
            }
            timer.run();
        }

        // Move playhead forward to at least make some progress.
        this._playhead += 1;
    }

    // Set the final value of the playhead to what was passed in.
    this._playhead = value;
    this._duration = Math.max(this._duration, this._playhead);

    // Update all tweens.
    tweens = this.tweens();
    for (i = 0; i < tweens.length; i += 1) {
        tween = tweens[i];
        tween.update(this._playhead);
    }

    return this;
};

/**
 * Retrieves the duration of the frame. This is the maximum playhead
 * position that has been seen.
 */
Frame.prototype.duration = function () {
    return this._duration;
};

/**
 * Executes a function after a given delay.
 *
 * @param {Function}
 */
Frame.prototype.timer = function (fn) {
    var timer = new Timer(fn);
    timer.startTime(this.playhead());
    this._timers.push(timer);
    return timer;
};

/**
 * Creates a tween to update on each tick.
 *
 * @param {Function}
 * @param {Number}
 */
Frame.prototype.tween = function (fn, startValue, endValue, duration, delay) {
    if (duration === undefined) {
        duration = 0;
    }
    duration = Math.max(0, duration);

    if (delay === undefined) {
        delay = 0;
    }
    delay = Math.max(0, delay);

    var startTime = this.playhead() + delay,
        endTime = startTime + duration,
        tween = new Tween(fn, startValue, endValue, startTime, endTime);
    console.log(startTime, endTime, startValue, endValue);
    this._tweens.push(tween);

    // Execute tween immediately if there is no delay.
    if (delay === 0) {
        tween.update();
    }

    return tween;
};

/**
 * Retrieves a list of active timers sorted by time until next frame.
 */
Frame.prototype.timers = function () {
    var i, timer, playhead = this.playhead();

    // Stop all timers that don't have a next play time.
    for (i = 0; i < this._timers.length; i += 1) {
        timer = this._timers[i];
        if (timer.until(playhead) === null) {
            timer.stop();
        }
    }

    // Remove all stopped timers.
    this._timers = this._timers.filter(function (timer) {
        return timer.running();
    });

    // Sort remaining timers by next play time.
    this._timers = this._timers.sort(function (a, b) {
        var ret = a.until(playhead) - b.until(playhead);
        return (ret !== 0 ? ret : a.id() - b.id());
    });

    return this._timers;
};

/**
 * Retrieves a list of active tweens sorted by start time.
 */
Frame.prototype.tweens = function () {
    var playhead = this.playhead();
    this._tweens = this._tweens.filter(function (tween) {
        return playhead < tween.endTime();
    });
    this._tweens = this._tweens.sort(function (a, b) {
        return a.startTime - b.startTime;
    });
    return this._tweens;
};

/**
 * Sets or retrieves the initial frame data model.
 *
 * @return {Frame|Object}
 */
Frame.prototype.model = function (value) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = value;
    return this;
};

/**
 * Retrieves the layout used by the player.
 *
 * @return {Layout}
 */
Frame.prototype.layout = function (value) {
    var player = this.player();
    return (player !== null ? player.layout() : null);
};

/**
 * Resets the playhead and clears the timers on the frame.
 */
Frame.prototype.reset = function () {
    var i;
    this._playhead = 0;
    this._duration = 0;
    for (i = 0; i < this._timers.length; i += 1) {
        this._timers[0].stop();
    }
    this._timers = [];
};

/**
 * Sets or retrieves the onend handler.
 *
 * @return {Function|Frame}
 */
Frame.prototype.onend = function (fn) {
    if (arguments.length === 0) {
        return this._onend;
    }
    this._onend = fn;
    return this;
};


module.exports = Frame;

});
require.register("playback/lib/functor.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Creates a function that returns v. If v is a function then it
 * is returned instead.
 *
 * @return {Function}
 */
function functor(v) {
    return typeof v === "function" ? v : function () {
        return v;
    };
}

module.exports = functor;


});
require.register("playback/lib/layout.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Layout instance.
 */
function Layout() {
    this._player = null;
}

/**
 * Initializes the layout. This is called when the player is set on
 * the layout.
 */
Layout.prototype.initialize = function () {
    // Implemented by subclass.
};

/**
 * Sets or retrieves the player associated with the layout.
 *
 * @return {Player|Layout}
 */
Layout.prototype.player = function (value) {
    if (arguments.length === 0) {
        return this._player;
    }
    this._player = value;
    this.initialize();
    return this;
};

/**
 * Retrieves the current frame on the player.
 *
 * @return {Frame}
 */
Layout.prototype.current = function () {
    var player = this.player();
    if (player === null) {
        return null;
    }
    return player.current();
};

/**
 * Retrieves the current frame's model.
 *
 * @return {Model}
 */
Layout.prototype.model = function () {
    var current = this.current();
    if (current === null) {
        return null;
    }
    return current.model();
};

module.exports = Layout;

});
require.register("playback/lib/model.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Model instance.
 */
function Model() {
}

/**
 * Clones the current state of the model.
 */
Model.prototype.clone = function () {
    return this;
};

module.exports = Model;

});
require.register("playback/lib/playback.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var Player = require('./player'),
    Layout = require('./layout'),
    Model = require('./model');

/**
 * Initializes a new Playback instance.
 */
function Playback() {
}

/**
 * Creates a new player.
 */
Playback.prototype.player = function () {
    return new Player();
};

/**
 * Retrieves the layout superclass.
 */
Playback.prototype.layout = function () {
    return new Layout();
};

/**
 * Retrieves the model superclass.
 */
Playback.prototype.model = function () {
    return new Model();
};

module.exports = Playback;

Playback.VERSION = Playback.prototype.VERSION = '0.0.1';


});
require.register("playback/lib/player.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var Frame    = require('./frame'),
    is       = require('is'),
    nextTick = require('next-tick'),
    periodic = require('periodic');

/**
 * Initializes a new Player instance.
 */
function Player() {
    this._rate = 0;
    this._currentIndex = -1;
    this._frames = [];
    this._prevtick = null;
    this._ticker = null;
    this._model = null;
    this._layout = null;
    this._onupdate = null;
    this._onframechange = null;
}

/**
 * Sets or retrieves the playback rate of the player. This is the rate
 * at which the current frame playhead is moved forward in relation to
 * the wall clock.
 *
 * @return {Player|int}
 */
Player.prototype.rate = function (value) {
    if (arguments.length === 0) {
        return this._rate;
    }
    this._rate = Math.max(0, value);

    // Manage the ticker.
    var self = this,
        prevtick = new Date();
    if (this._rate > 0 && this._ticker === null) {
        this.tick(0);
        this._ticker = periodic(100).on('tick', function () {
            var t = new Date();
            self.tick(self.rate() * (t.valueOf() - prevtick.valueOf()));
            prevtick = t;
        });
    } else if (this._rate === 0 && this._ticker !== null) {
        self.tick(self.rate() * ((new Date()).valueOf() - prevtick.valueOf()));
        this._ticker.end();
    }

    return this;
};

/**
 * Starts the player.
 *
 * @return {Player}
 */
Player.prototype.play = function () {
    this.rate(1);
    return this;
};

/**
 * Stops the player.
 *
 * @return {Player}
 */
Player.prototype.pause = function () {
    this.rate(0);
    return this;
};

/**
 * Returns a flag stating if the playhead is moving.
 *
 * @return {Boolean}
 */
Player.prototype.playing = function () {
    return (this.rate() !== 0);
};

/**
 * Appends a new frame to the player.
 *
 * @return {Player}
 */
Player.prototype.frame = function (value) {
    var frame;
    if (is.number(value)) {
        if (value >= 0 && value < this._frames.length) {
            return this._frames[value];
        }
        return null;
    }

    if (is.fn(value)) {
        frame = new Frame(value);
        frame.player(this);
        this._frames.push(frame);
        if (this.current() === null) {
            this.currentIndex(0);
        }
        return this;
    }

    throw "Player.frame() invalid argument: " + value;
};

/**
 * Retrieves a list of all frames.
 *
 * @return {Array}
 */
Player.prototype.frames = function () {
    return this._frames.slice();
};

/**
 * Sets or retrieves the current frame.
 *
 * @return {Player|Frame}
 */
Player.prototype.current = function (value) {
    if (arguments.length === 0) {
        if (this._currentIndex === -1 || this._frames.length === 0) {
            return null;
        }
        return this._frames[this._currentIndex];
    }

    // Find the index of the frame and set it.
    var index = this._frames.indexOf(value);
    if (index !== -1) {
        this.currentIndex(index);
    }
    return this;
};

/**
 * Sets or retrieves the current frame index.
 *
 * @return {Player|Number}
 */
Player.prototype.currentIndex = function (value) {
    var frame, model;

    if (arguments.length === 0) {
        return this._currentIndex;
    }

    // Don't allow initialization if we don't have a model.
    if (this._currentIndex === -1 && this.model() === null) {
        return this;
    }

    // Move to new frame and initialize it.
    if (value >= 0 && value < this._frames.length && value !== this._currentIndex) {
        model = (this.frame(value - 1) !== null ? this.frame(value - 1).model() : this.model());
        if (model !== null) {
            model = model.clone();
        }

        this._currentIndex = value;
        frame = this._frames[value];
        frame.model(model);
        frame.init();
        if (this.onframechange() !== null) {
            this.onframechange().call(this);
        }
    }
    return this;
};

/**
 * Moves to the next frame.
 *
 * @return {Player}
 */
Player.prototype.next = function () {
    this.currentIndex(this.currentIndex() + 1);
    return this;
};

/**
 * Moves to the previous frame.
 *
 * @return {Player}
 */
Player.prototype.prev = function () {
    this.currentIndex(this.currentIndex() - 1);
    return this;
};

/**
 * Sets or retrieves the initial player data model.
 *
 * @return {Player|Object}
 */
Player.prototype.model = function (value) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = value;

    // Initialize first frame now that we have a model.
    if (this.current() === null) {
        this.currentIndex(0);
    }

    return this;
};

/**
 * Sets or retrieves the layout.
 *
 * @return {Player|Layout}
 */
Player.prototype.layout = function (value) {
    if (arguments.length === 0) {
        return this._layout;
    }

    if (this._layout !== null) {
        this._layout.player(null);
    }

    this._layout = value;

    if (this._layout !== null) {
        this._layout.player(this);
    }

    return this;
};

/**
 * Updates the player and issues the 'update' callback. This is called
 * whenever the playhead is changed.
 *
 * @return {Player}
 */
Player.prototype.update = function () {
    if (is.fn(this.onupdate())) {
        this.onupdate().call(this, this);
    }
    return this;
};

/**
 * Updates the playhead of the current frame based on the elapsed time
 * and playback rate. The elapsed time argument is in player-time.
 */
Player.prototype.tick = function (elapsed) {
    var frame = this.current();
    if (frame === null) {
        return;
    }
    frame.playhead(frame.playhead() + elapsed);
    this.update();
};

/**
 * Sets or retrieves the callback function that executes whenever the
 * playhead is updated.
 *
 * @return {Function|Player}
 */
Player.prototype.onupdate = function (fn) {
    if (arguments.length === 0) {
        return this._onupdate;
    }
    this._onupdate = fn;
    return this;
};

/**
 * Sets or retrieves the callback function that executes whenever the
 * current frame index is changed.
 *
 * @return {Function|Player}
 */
Player.prototype.onframechange = function (fn) {
    if (arguments.length === 0) {
        return this._onframechange;
    }
    this._onframechange = fn;
    return this;
};

module.exports = Player;

});
require.register("playback/lib/timer.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Timer instance.
 */
function Timer(fn) {
    this._id = Timer.nextid;
    Timer.nextid += 1;

    this._fn = fn;
    this._startTime = undefined;
    this._endTime = undefined;
    this._interval = undefined;
    this._running = true;
}

Timer.nextid = 1;

/**
 * Retrieves the timer identifier.
 *
 * @return {Number}
 */
Timer.prototype.id = function () {
    return this._id;
};

/**
 * Retrieves the start time of the timer.
 *
 * @return {Number}
 */
Timer.prototype.startTime = function (value) {
    if (arguments.length === 0) {
        return this._startTime;
    }
    this._startTime = value;
    return this;
};

/**
 * Retrieves the end time of the timer. Returns undefined if there is
 * no end time.
 *
 * @return {Number}
 */
Timer.prototype.endTime = function (value) {
    if (arguments.length === 0) {
        return this._endTime;
    }
    this._endTime = value;
    return this;
};

/**
 * Retrieves the interval in milliseconds between executions.
 *
 * @return {Number}
 */
Timer.prototype.interval = function (value) {
    if (arguments.length === 0) {
        return this._interval;
    }
    if (value <= 0) {
        this._interval = undefined;
    } else {
        this._interval = value;
    }
    return this;
};

/**
 * Increments the start time by a given number of milliseconds.
 *
 * @param {Number}
 */
Timer.prototype.delay = function (value) {
    if (value <= 0) {
        return;
    }
    this._startTime += value;
    return this;
};

/**
 * Sets the number of times the timer should execute.
 *
 * @param {Number}
 */
Timer.prototype.times = function (value) {
    this.endTime(this.startTime() + (this.interval() * (Math.max(1, value))));
    return this;
};

/**
 * Sets end time based on the start time and given duration.
 *
 * @param {Number}
 */
Timer.prototype.duration = function (value) {
    if (arguments.length === 0) {
        if (this._endTime === undefined) {
            return undefined;
        }
        return this._endTime - this._startTime;
    }
    this.endTime(this.startTime() + value);
    return this;
};

/**
 * Retrieves whether the timer is actively running.
 *
 * @return {Boolean}
 */
Timer.prototype.running = function () {
    return this._running;
};

/**
 * Stops the timer.
 *
 * @return {Timer}
 */
Timer.prototype.stop = function () {
    this._running = false;
    return this;
};

/**
 * Executes the timer function.
 */
Timer.prototype.run = function () {
    this._fn.call(this, this);
};

/**
 * Retrieves the time of the next execution on or after a given time.
 *
 * @return {Number}
 */
Timer.prototype.until = function (t) {
    var offset,
        startTime = this.startTime(),
        endTime   = this.endTime(),
        interval  = this.interval();

    if (!this.running() || startTime === undefined || interval === undefined) {
        return null;
    }

    // If we haven't reached the start time then the next execution
    // is the start time.
    if (startTime > t) {
        return startTime;
    }

    // If we're past the end time then return null.
    if (endTime !== undefined && t > endTime) {
        return null;
    }

    // If t is on an interval then return it.
    offset = t - startTime;
    if (offset % interval === 0) {
        return t;
    }

    // Otherwise find the next interval that occurs immediately after t.
    return startTime + ((Math.floor(offset / interval) + 1) * interval);
};

module.exports = Timer;

});
require.register("playback/lib/tween.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var ease    = require('./ease'),
    functor = require('./functor'),
    is      = require('is');

/**
 * Initializes a new Tween instance.
 */
function Tween(fn, startValue, endValue, startTime, endTime) {
    if (!is.fn(fn)) {
        fn = null;
    }
    this._fn = fn;
    this._startValue = functor(startValue);
    this._endValue = functor(endValue);
    this._startTime = startTime;
    this._endTime = Math.max(startTime, endTime);
    this._ease = ease.linear;
}

/**
 * Retrieves the tween start time.
 *
 * @return {Number}
 */
Tween.prototype.startTime = function () {
    return this._startTime;
};

/**
 * Retrieves the tween end time.
 *
 * @return {Number}
 */
Tween.prototype.endTime = function () {
    return this._endTime;
};

/**
 * Retrieves the tween start value.
 *
 * @return {Number}
 */
Tween.prototype.startValue = function () {
    return this._startValue();
};

/**
 * Retrieves the tween end value.
 *
 * @return {Number}
 */
Tween.prototype.endValue = function () {
    return this._endValue();
};

/**
 * Sets or retrieves the easing function used by the tween.
 *
 * @return {Number}
 */
Tween.prototype.ease = function (value) {
    if (arguments.length === 0) {
        return this._ease;
    }
    if (is.fn(value)) {
        this._ease = value;
    } else {
        this._ease = ease(value);
    }
    return this;
};

/**
 * Retrieves the value at a given point in time.
 *
 * @return {Number}
 */
Tween.prototype.value = function (t) {
    var startValue = this.startValue(),
        endValue = this.endValue(),
        startTime = this.startTime(),
        endTime = this.endTime(),
        delta = endValue - startValue;
    if (startTime === endTime) {
        return endValue;
    }
    return delta * this._ease(Math.max(0, Math.min(1, (t - startTime) / (endTime - startTime))));
};

/**
 * Executes the function associated with the tween at a given time.
 * Returns the result of the function. The function is not called if t
 * is before the start time.
 *
 * @return {Object}
 */
Tween.prototype.update = function (t) {
    if (this._fn === null || t < this.startTime()) {
        return null;
    }
    return this._fn.call(this, this.value(t));
};

module.exports = Tween;

});




require.alias("ianstormtaylor-is/index.js", "playback/deps/is/index.js");
require.alias("ianstormtaylor-is/index.js", "is/index.js");
require.alias("component-type/index.js", "ianstormtaylor-is/deps/type/index.js");

require.alias("ianstormtaylor-is-empty/index.js", "ianstormtaylor-is/deps/is-empty/index.js");

require.alias("juliangruber-periodic/index.js", "playback/deps/periodic/index.js");
require.alias("juliangruber-periodic/index.js", "periodic/index.js");
require.alias("juliangruber-events/index.js", "juliangruber-periodic/deps/events/index.js");
require.alias("component-emitter/index.js", "juliangruber-events/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("timoxley-next-tick/index.js", "playback/deps/next-tick/index.js");
require.alias("timoxley-next-tick/index.js", "next-tick/index.js");

require.alias("playback/lib/index.js", "playback/index.js");if (typeof exports == "object") {
  module.exports = require("playback");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("playback"); });
} else {
  this["playback"] = require("playback");
}})();