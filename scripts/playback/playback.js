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
require.register("playback/lib/data_object.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher');

/**
 * Initializes a new DataObject instance.
 */
function DataObject(model) {
    EventDispatcher.call(this);
    this._model = (model !== undefined ? model : null);
}

DataObject.prototype = new EventDispatcher();
DataObject.prototype.constructor = DataObject;

/**
 * Sets or retrieves the model that the data object belongs to.
 *
 * @return {DataObject|Model}
 */
DataObject.prototype.model = function (value) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = value;
    return this;
};

/**
 * Retrieves the player.
 *
 * @return {Player}
 */
DataObject.prototype.player = function () {
    return (this._model !== null ? this._model.player() : null);
};

/**
 * Retrieves the current frame.
 *
 * @return {Frame}
 */
DataObject.prototype.frame = function () {
    return (this._model !== null ? this._model.frame() : null);
};

/**
 * Retrieves the layout.
 *
 * @return {Layout}
 */
DataObject.prototype.layout = function () {
    return (this.frame() !== null ? this.frame().layout() : null);
};

module.exports = DataObject;

});
require.register("playback/lib/event.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

function Event(type, value, prevValue) {
    this.type = type;
    this.target = null;
    this.value = value;
    this.prevValue = prevValue;
}

module.exports = Event;

});
require.register("playback/lib/event_dispatcher.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var Event = require('./event');

/**
 * EventDispatcher is a subclass for any objects that want to dispatch
 * events through the standard addEventListener()/removeEventListener()
 * interface.
 */
function EventDispatcher() {
    this._eventListeners = {};
}

/**
 * Adds a new event listener for a given event type.
 *
 * @param {String}
 * @param {Function}
 * @return {EventDispatcher}
 */
EventDispatcher.prototype.addEventListener = function (type, listener) {
    if (this._eventListeners[type] === undefined) {
        this._eventListeners[type] = [];
    }
    if (this._eventListeners[type].indexOf(listener) === -1) {
        this._eventListeners[type].push(listener);
    }
    return this;
};

/**
 * Removes an event listener for a given event type.
 *
 * @param {String}
 * @param {Function}
 * @return {EventDispatcher}
 */
EventDispatcher.prototype.removeEventListener = function (type, listener) {
    var index;
    if (this._eventListeners[type] !== undefined) {
        index = this._eventListeners[type].indexOf(listener);
        if (index !== -1) {
            this._eventListeners[type].splice(index, 1);
        }
    }
    return this;
};

/**
 * Dispatches an event to all listeners of given event's type.
 *
 * @param {Event}
 */
EventDispatcher.prototype.dispatchEvent = function (event) {
    var i, listeners = this._eventListeners[event.type];

    // Only update the target if this is the first dispatch.
    if (event.target === null || event.target === undefined) {
        event.target = this;
    }

    if (listeners !== undefined) {
        for (i = 0; i < listeners.length; i += 1) {
            listeners[i].call(null, event);
        }
    }
    return this;
};

/**
 * Ease-of-use function to dispatch a change event with the value and previous value.
 *
 * @param {String}
 * @param {Object}
 * @param {Object}
 */
EventDispatcher.prototype.dispatchChangeEvent = function (eventType, value, prevValue) {
    var event = new Event(eventType, value, prevValue);
    return this.dispatchEvent(event);
};

module.exports = EventDispatcher;

});
require.register("playback/lib/frame.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event'),
    Snapshot        = require('./snapshot'),
    Timer           = require('./timer'),
    is              = require('is');

/**
 * Initializes a new Frame instance.
 */
function Frame(id, title, fn) {
    EventDispatcher.call(this);

    if (!is.fn(fn)) {
        throw "Frame function required";
    }
    this._id = id;
    this._title = title;
    this._fn = fn;
    this._player = null;
    this._playhead = 0;
    this._model = null;
    this._timers = [];
    this._executedTimers = {};
    this._snapshots = [];
}

Frame.prototype = new EventDispatcher();
Frame.prototype.constructor = Frame;

/**
 * Returns the frame identifier.
 *
 * @return {String}
 */
Frame.prototype.id = function () {
    return this._id;
};

/**
 * Returns the frame title.
 *
 * @return {String}
 */
Frame.prototype.title = function () {
    return this._title;
};

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
 * Stops the frame and executes an "end" event.
 *
 * @return {Frame}
 */
Frame.prototype.end = function () {
    this.reset();
    this.dispatchEvent(new Event("end"));
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
Frame.prototype.playhead = function (v) {
    var i, timers, nextTimerAt,
        self = this,
        value = Math.ceil(v);

    if (arguments.length === 0) {
        return this._playhead;
    }
    if (this._playhead >= value) {
        return this;
    }

    this.removeStaleTimers();

    // Execute timers between previous playhead position and current.
    while (true) {
        // Continue executing timers at this playhead position until there are
        // none left. This can loop multiple times if timers are created without
        // a delay. This can go in an infinite loop if a timer keeps creating 
        // new undelayed timers that create other new undelayed timers.
        while (true) {
            timers = this.currentTimers();
            if (timers.length === 0) {
                break;
            }

            // Run all timers the current playhead position.
            for (i = 0; i < timers.length; i += 1) {
                timers[i].run();
                this._executedTimers[timers[i].id()] = true;
            }
            this.removeStaleTimers();
        }


        // Stop moving the playhead forward if a timer paused the player.
        if (this.player() !== null && this.player().rate() === 0) {
            break;
        }

        // If we have no future timers before the next playhead then exit.
        nextTimerAt = this.nextTimerAt(this._playhead + 1);
        if (nextTimerAt === null || nextTimerAt > value || nextTimerAt === Timer.MAX) {
            break;
        }
        this._playhead = nextTimerAt;
        this._executedTimers = {};
    }

    // Set the final value of the playhead to what was passed in if still playing.
    if (this.player() === null || this.player().rate() > 0) {
        this._playhead = value;
    }

    this.removeStaleTimers();

    return this;
};

/**
 * Executes a function after a given delay.
 *
 * @param {Function}
 */
Frame.prototype.timer = function (fn) {
    var timer = new Timer(this, fn);
    timer.startTime(this.playhead());
    this._timers.push(timer);
    return timer;
};

/**
 * Creates a single use timer that executes after a given delay.
 *
 * @param {Number}
 * @param {Function}
 * @return {Timer}
 */
Frame.prototype.after = function (delay, fn) {
    return this.timer(fn).delay(delay);
};

/**
 * Retrieves a list of active timers sorted by time until next frame.
 */
Frame.prototype.timers = function (playhead) {
    var _playhead = (playhead !== undefined ? playhead : this.playhead());

    // Sort timers by next play time.
    this._timers = this._timers.sort(function (a, b) {
        var ret = a.until(_playhead) - b.until(_playhead);
        return (ret !== 0 ? ret : a.id() - b.id());
    });

    return this._timers;
};

/**
 * Retrieves a list of active timers at the current playhead.
 */
Frame.prototype.currentTimers = function () {
    var self = this, playhead = this.playhead();
    return this.timers().filter(function (timer) {
        return !self._executedTimers[timer.id()] && timer.until(playhead) === playhead;
    });
};

/**
 * Stops a timer with the given identifier.
 */
Frame.prototype.clearTimer = function (value) {
    var i,
        id = (is.object(value) ? value.id() : value);
    for (i = 0; i < this._timers.length; i += 1) {
        if (this._timers[i].id() === id) {
            this._timers[i].stop();
        }
    }
};

/**
 * Removes timers that are stopped or don't have a next execution time.
 */
Frame.prototype.removeStaleTimers = function () {
    var i, timer, nextTime, playhead = this.playhead();

    // Stop all timers that don't have a next play time.
    for (i = 0; i < this._timers.length; i += 1) {
        timer = this._timers[i];
        nextTime = timer.until(playhead + (this._executedTimers[timer.id()] ? 1 : 0));
        if (nextTime === null) {
            timer.stop();
        }
    }

    // Remove all stopped timers.
    this._timers = this._timers.filter(function (timer) {
        return timer.running();
    });
};

/**
 * Retrieves the playhead position of the next timer from a given start time.
 */
Frame.prototype.nextTimerAt = function (playhead) {
    var timers = this.timers(playhead);
    if (timers.length === 0) {
        return null;
    }
    return timers[0].until(playhead);
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
 * Snapshots the state of the frame.
 */
Frame.prototype.snapshot = function () {
    var snapshot = new Snapshot(this);
    this._snapshots.push(snapshot);
    return snapshot;
};

/**
 * Restores the state of the frame from a given snapshot state.
 */
Frame.prototype.restore = function (snapshot) {
    var index = this._snapshots.indexOf(snapshot);
    if (index !== -1) {
        this._snapshots = this._snapshots.slice(0, index);
    }
    this._playhead = snapshot.playhead() - 1;
    this._timers = snapshot.timers();
    this._model = snapshot.model();
    return this;
};

/**
 * Restores the last available snapshot.
 */
Frame.prototype.rollback = function (offset) {
    var index = Math.max(0, this._snapshots.length - offset);
    if (index < this._snapshots.length) {
        this.restore(this._snapshots[index]);
    }
    return this;
};

/**
 * Returns whether the frame can be rollbacked by the given number of snapshots.
 */
Frame.prototype.rollbackable = function (offset) {
    return offset <= this._snapshots.length;
};

/**
 * Resets the playhead and clears the timers on the frame.
 */
Frame.prototype.reset = function () {
    var i;
    this._playhead = 0;
    for (i = 0; i < this._timers.length; i += 1) {
        this._timers[0].stop();
    }
    this._timers = [];
    this._snapshots = [];
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
require.register("playback/lib/index.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var Playback = require('./playback');

module.exports = new Playback();

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
 * Redraws the layout.
 */
Layout.prototype.invalidate = function () {
    // Implemented by subclass.
};

/**
 * Updates the layout to the new window size.
 */
Layout.prototype.invalidateSize = function () {
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
    this.invalidateSize();
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

var EventDispatcher = require('./event_dispatcher');

/**
 * Initializes a new Model instance.
 */
function Model() {
    EventDispatcher.call(this);
    this._player = null;
}

Model.prototype = new EventDispatcher();
Model.prototype.constructor = Model;

/**
 * Sets or retrieves the player the model is attached to.
 *
 * @return {Model|Player}
 */
Model.prototype.player = function (value) {
    if (arguments.length === 0) {
        return this._player;
    }
    this._player = value;
    return this;
};

/**
 * Retrieves the current frame.
 *
 * @return {Frame}
 */
Model.prototype.frame = function () {
    return (this.player() !== null ? this.player().current() : null);
};

/**
 * Retrieves the playhead of the current frame.
 *
 * @return {Number}
 */
Model.prototype.playhead = function () {
    if (this.player() !== null && this.player().current() !== null) {
        return this.player().current().playhead();
    }
    return null;
};

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

var DataObject = require('./data_object'),
    Layout = require('./layout'),
    Model  = require('./model'),
    Player = require('./player'),
    Set    = require('./set');

/**
 * Initializes a new Playback instance.
 */
function Playback() {
}

Playback.prototype.DataObject = DataObject;
Playback.prototype.Layout     = Layout;
Playback.prototype.Model      = Model;
Playback.prototype.Player     = Player;
Playback.prototype.Set        = Set;

/**
 * Creates a new player.
 */
Playback.prototype.player = function () {
    return new Player();
};

module.exports = Playback;

Playback.VERSION = Playback.prototype.VERSION = '0.1.1';


});
require.register("playback/lib/player.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/
/*global window*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event'),
    Frame           = require('./frame'),
    is              = require('is'),
    periodic        = require('periodic'),
    _               = require('./raf'),
    MAX_DELTA       = 50;

/**
 * Initializes a new Player instance.
 */
function Player() {
    var self = this,
        animationFrame;

    EventDispatcher.call(this);

    this._rate = 0;
    this._currentIndex = -1;
    this._frames = [];
    this._prevtick = null;
    this._ticker = null;
    this._model = null;
    this._layout = null;

    this._resizeable = false;
    this._resizeableInitialized = false;
    this._sysresizehandler = null;

    // Setup animation timer.
    animationFrame = function () {
        self.tick();
        window.requestAnimationFrame(animationFrame);
    };
    this._rAFID = window.requestAnimationFrame(animationFrame);
}

Player.prototype = new EventDispatcher();
Player.prototype.constructor = Player;

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
    if (this._rate > 0 && this._ticker === null) {
        this.tick(0);
    } else if (this._rate === 0 && this._ticker !== null) {
        this.tick(this.rate() * ((new Date()).valueOf() - this._prevtick.valueOf()));
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
 * Pauses the player.
 *
 * @return {Player}
 */
Player.prototype.pause = function () {
    this.rate(0);
    return this;
};

/**
 * Stops the player completely. Player cannot be restarted.
 *
 * @return {Player}
 */
Player.prototype.stop = function () {
    this.pause(0);
    window.cancelAnimationFrame(this._rAFID);
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
 * @param {String|Number}
 * @param {String}
 * @param {Function}
 * @return {Player}
 */
Player.prototype.frame = function (id, title, fn) {
    var i, frame;
    if (arguments.length === 0) {
        throw new Error("Expected 1 or 3 arguments");
    }

    if (arguments.length === 1) {
        // Look up by index.
        if (is.number(id)) {
            if (id >= 0 && id < this._frames.length) {
                return this._frames[id];
            }
            return null;
        }

        // Look up by id.
        for (i = 0; i < this._frames.length; i += 1) {
            if (id === this._frames[i].id()) {
                return this._frames[i];
            }
        }
        return null;
    }

    // Create new frame.
    frame = new Frame(id, title, fn);
    frame.player(this);
    this._frames.push(frame);
    if (this.current() === null) {
        this.currentIndex(0);
    }
    return this;
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
        if (this.currentIndex() === -1 || this.frames().length === 0) {
            return null;
        }
        return this.frames()[this._currentIndex];
    }

    // Find the index of the frame and set it.
    var index = this.frames().indexOf(value);
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
        // End previous frame.
        if (this.current() !== null) {
            this.current().end();
        }

        model = this.model().clone();

        this._currentIndex = value;
        frame = this._frames[value];
        frame.model(model);
        frame.init();
        this.dispatchEvent(new Event("framechange"));
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

    if (this._model !== null) {
        this._model.player(null);
    }

    this._model = value;

    if (this._model !== null) {
        this._model.player(this);
    }

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
 * Sets up handlers that invoke layout invalidation on window resize.
 */
Player.prototype.resizeable = function (value) {
    var self = this;

    if (arguments.length === 0) {
        return this._resizeable;
    }

    // Set up a handler that we can swap our internal handler out of.
    if (value && !this._resizeableInitialized) {
        this._resizeableInitialized = true;
        this._sysresizehandler = window.onresize;
        window.onresize = function () {
            if (is.fn(self._sysresizehandler)) {
                self._sysresizehandler.apply(null, arguments);
            }
            if (self._resizeable) {
                self.resize();
            }
        };
    }

    this._resizeable = value;

    return this;
};

/**
 * Invalidates the size of the layout.
 */
Player.prototype.resize = function () {
    if (this.layout() !== null) {
        this.layout().invalidateSize();
    }
};

/**
 * Updates the playhead of the current frame based on the elapsed time
 * and playback rate.
 */
Player.prototype.tick = function () {
    var frame = this.current(),
        t = new Date(),
        prevtick = (this._prevtick !== null ? this._prevtick : t),
        delta = Math.min(MAX_DELTA, (t.valueOf() - prevtick.valueOf())),
        elapsed = this.rate() * delta;

    if (frame !== null) {
        frame.playhead(frame.playhead() + elapsed);
        this.dispatchEvent(new Event("tick"));
    }

    this._prevtick = t;
};

module.exports = Player;

});
require.register("playback/lib/raf.js", function(exports, require, module){
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
//
// MIT license

"use strict";
/*jslint browser: true, nomen: true*/
/*global window*/

var x,
    lastTime = 0,
    vendors = ['ms', 'moz', 'webkit', 'o'];
for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}

module.exports = null;

});
require.register("playback/lib/snapshot.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Snapshot instance.
 */
function Snapshot(frame) {
    var i, timers;
    this._playhead = frame.playhead();
    this._model = frame.model().clone();
    this._timers = [];

    timers = frame.timers();
    for (i = 0; i < timers.length; i += 1) {
        this._timers.push(timers[i].clone());
    }
}

/**
 * Returns the playhead of the snapshot.
 *
 * @return {Number}
 */
Snapshot.prototype.playhead = function () {
    return this._playhead;
};

/**
 * Returns a clone of the model of the snapshot.
 *
 * @return {Model}
 */
Snapshot.prototype.model = function () {
    return this._model.clone();
};

/**
 * Returns the timers at the time of the snapshot.
 *
 * @return {Array}
 */
Snapshot.prototype.timers = function () {
    var i, timers = [];
    for (i = 0; i < this._timers.length; i += 1) {
        timers.push(this._timers[i].clone());
    }
    return timers;
};

module.exports = Snapshot;

});
require.register("playback/lib/set.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var DataObject = require('./data_object'),
    Event      = require('./event'),
    is         = require('is');

/**
 * A Set is a collection of unique objects where uniqueness is
 * determined by the "id" property.
 */
function Set(model, clazz) {
    DataObject.call(this, model);
    this.clazz(clazz);
    this._elements = [];
}

Set.prototype = new DataObject();
Set.prototype.constructor = Set;


/**
 * Sets or retrieves the model that the data object belongs to.
 *
 * @return {DataObject|Model}
 */
Set.prototype.model = function (value) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = value;
    this._elements.forEach(function (element) {
        element.model(value);
    });
    return this;
};

/**
 * Sets or retrieves the item class used for instantitation.
 *
 * @param {Function}
 * @return {Set|Function}
 */
Set.prototype.clazz = function (value) {
    if (arguments.length === 0) {
        return this._clazz;
    }
    this._clazz = (is.fn(value) ? value : null);
    return this;
};

/**
 * Creates a new instance of the set's class and adds it to the set.
 * The first parameter is passed to the class' constructor.
 *
 * @param {Number}
 * @return {Object}
 */
Set.prototype.create = function (id) {
    var element = this.find(id),
        clazz = this.clazz();

    if (clazz === null) {
        throw "Class not defined on Set. Unable to instantiate element.";
    }

    // Use existing element if possible.
    if (element !== null) {
        return element;
    }

    // Otherwise create a new element and add it.
    element = new this._clazz(this.model(), id);
    this.add(element);
    return element;
};

/**
 * Retrieves an element by id.
 *
 * @param {Number|String}
 * @return {Object}
 */
Set.prototype.find = function (value) {
    var i;
    for (i = 0; i < this._elements.length; i += 1) {
        if (this._elements[i].id === value || (is.fn(value) && value(this._elements[i]))) {
            return this._elements[i];
        }
    }
    return null;
};

/**
 * Checks for an existing element in the set with the same id.
 *
 * @param {Object}
 * @return {Boolean}
 */
Set.prototype.contains = function (element) {
    return (this.find(element.id) !== null);
};

/**
 * Adds an element to the set.
 *
 * @param {Object}
 * @return {Set}
 */
Set.prototype.add = function (element) {
    if (!this.contains(element)) {
        this._elements.push(element);
        this.dispatchEvent(new Event("change"));
    }
    return this;
};

/**
 * Removes an element from the set.
 *
 * @param {Object}
 * @return {Set}
 */
Set.prototype.remove = function (element) {
    var i;
    for (i = 0; i < this._elements.length; i += 1) {
        if (this._elements[i].id === element.id) {
            this._elements.splice(i, 1);
            this.dispatchEvent(new Event("change"));
            break;
        }
    }
    return this;
};

/**
 * Removes all elements from the set.
 *
 * @return {Set}
 */
Set.prototype.removeAll = function () {
    if (this._elements.length > 0) {
        this._elements = [];
        this.dispatchEvent(new Event("change"));
    }
    return this;
};

/**
 * Filters the set down based on a given filter function.
 *
 * @return {Set}
 */
Set.prototype.filter = function (fn) {
    this._elements = this._elements.filter(fn);
    this.dispatchEvent(new Event("change"));
    return this;
};


/**
 * Retrieves a list of all elements as an array.
 *
 * @return {Array}
 */
Set.prototype.toArray = function () {
    return this._elements.slice();
};

/**
 * Retrieves the number of elements in the set.
 *
 * @return {Number}
 */
Set.prototype.size = function () {
    return this._elements.length;
};

/**
 * Returns whether the set contains zero elements.
 *
 * @return {Boolean}
 */
Set.prototype.empty = function () {
    return (this.size() === 0);
};

/**
 * Clones the set.
 *
 * @return {Set}
 */
Set.prototype.clone = function (model) {
    var i,
        self = this,
        clone = new Set(model, this._clazz);
    clone._elements = this._elements.map(function (element) { return element.clone(model); });
    return clone;
};

module.exports = Set;

});
require.register("playback/lib/timer.js", function(exports, require, module){

"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event');

/**
 * Initializes a new Timer instance.
 */
function Timer(frame, fn) {
    EventDispatcher.call(this);

    this._id = Timer.nextid;
    Timer.nextid += 1;

    this._frame = frame;
    this._fn = fn;
    this._startTime = undefined;
    this._interval = undefined;
    this._duration = undefined;
    this._running = true;
    this._dependents = [];
}

Timer.prototype = new EventDispatcher();
Timer.prototype.constructor = Timer;

Timer.nextid = 1;

Timer.MAX = 9007199254740992;

/**
 * Retrieves the timer identifier.
 *
 * @return {Number}
 */
Timer.prototype.id = function () {
    return this._id;
};

/**
 * Retrieves the frame this timer is associated with.
 *
 * @return {Frame}
 */
Timer.prototype.frame = function () {
    return this._frame;
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
    this._startTime = Math.round(value);
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
        this._interval = Math.round(value);
    }
    return this;
};

/**
 * Increments the start time by a given number of milliseconds.
 *
 * @param {Number}
 */
Timer.prototype.delay = function (value) {
    if (value > 0) {
        this._startTime += Math.round(value);
    }
    return this;
};

/**
 * Sets the number of times the timer should execute.
 *
 * @param {Number}
 */
Timer.prototype.times = function (value) {
    if (value > 1) {
        this.duration(this.interval() * (Math.round(value) - 1));
    } else {
        this.interval(undefined);
        this.duration(undefined);
    }
    return this;
};

/**
 * Sets end time based on the start time and given duration.
 *
 * @param {Number}
 */
Timer.prototype.duration = function (value) {
    if (arguments.length === 0) {
        return this._duration;
    }
    if (value >= 0) {
        this._duration = Math.round(value);
    } else {
        this._duration = undefined;
    }
    return this;
};

/**
 * Marks a timer as existing indefinitely by setting its interval to -1.
 */
Timer.prototype.indefinite = function () {
    this._interval = -1;
    return this;
};

/**
 * Creates a timer after this timer ends.
 *
 * @param {Function}
 * @return {Timer}
 */
Timer.prototype.then = function (fn) {
    var startTime = this.frame().playhead(),
        timer = new Timer(this.frame(), fn).startTime(startTime);

    this._dependents.push({startTime: startTime, timer: timer});

    return timer;
};

/**
 * Creates a timer that runs once after a given delay. The start time
 * of the new timer is relative to the end time of this timer.
 *
 * @param {Number}
 * @param {Function}
 * @return {Timer}
 */
Timer.prototype.after = function (delay, fn) {
    return this.then(fn).delay(delay);
};

/**
 * Creates a timer that runs at the next event of a given type.
 *
 * @param {Object}
 * @param {String}
 * @param {Function}
 * @return {Timer}
 */
Timer.prototype.at = function (target, eventType, fn) {
    return this.then(function () {
        var listener, timer = this;
        listener = function (event) {
            var ret = fn(event);
            if (ret !== false) {
                target.removeEventListener(eventType, listener);
                timer.stop();
            }
        };
        target.addEventListener(eventType, listener);
    }).indefinite();
};

/**
 * Sets or retrieves whether the timer is actively running. A timer can only
 * move from running to not running (aka stopped). Resuming is not currently
 * supported.
 *
 * @return {Frame|Boolean}
 */
Timer.prototype.running = function (value) {
    var i, dependent, offset;
    if (arguments.length === 0) {
        return this._running;
    }

    // Only update for stops.
    if (this._running && !value) {
        // Generate dependent timers when this one finishes.
        for (i = 0; i < this._dependents.length; i += 1) {
            dependent = this._dependents[i];

            // Offset by the original playhead position.
            offset = this.frame().playhead() - dependent.startTime;
            if (dependent.timer.startTime() !== undefined) {
                dependent.timer.startTime(dependent.timer.startTime() + offset);
            }
            this.frame()._timers.push(dependent.timer);
        }

        this.dispatchEvent(new Event("end"));
        this._running = value;
    }
    return this;
};

/**
 * Stops the timer.
 *
 * @return {Timer}
 */
Timer.prototype.stop = function () {
    this.running(false);
    return this;
};

/**
 * Executes the timer function.
 */
Timer.prototype.run = function () {
    this._fn.call(this, this);
    return this;
};

/**
 * Retrieves the time of the next execution on or after a given time.
 *
 * @return {Number}
 */
Timer.prototype.until = function (t) {
    var startTime = this.startTime(),
        interval  = this.interval(),
        duration  = this.duration(),
        offset    = t - startTime;

    // POSSIBLE TIMERS:
    // - Single use:      startTime only
    // - Unending Single: startTime + (interval == -1)
    // - Neverending:     startTime + interval
    // - Fixed length:    startTime + interval + duration
    if (!this.running()) {
        return null;
    }
    if (startTime === undefined) {
        return null;
    }
    if (t <= startTime) {
        return startTime;
    }
    if (interval === -1) {
        return Timer.MAX;
    }
    if (interval === undefined) {
        return null;
    }
    if (duration !== undefined && t > startTime + duration) {
        return null;
    }

    // If t is on an interval then return it, otherwise return next interval.
    if (offset % interval === 0) {
        return t;
    }
    return startTime + ((Math.floor(offset / interval) + 1) * interval);
};

/**
 * Returns a copy of the timer.
 *
 * @return {Timer}
 */
Timer.prototype.clone = function () {
    var i, clone = new Timer(this._frame, this._fn);
    clone._id = this._id;
    clone._startTime = this._startTime;
    clone._interval = this._interval;
    clone._duration = this._duration;
    clone._running = this._running;

    for (i = 0; i < this._dependents.length; i += 1) {
        clone._dependents.push({
            startTime: this._dependents[i].startTime,
            timer: this._dependents[i].timer.clone(),
        });
    }
    return clone;
};


module.exports = Timer;

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