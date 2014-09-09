'use strict';

exports.sources = {}

// Initial values for overriding and prototyping in spawn
exports.mixins = {};
exports.attributes = {};
exports.block = null;
exports.self = null;
exports.trace = [];
exports.depth = 0;

exports.emit = function emit(chunk){/* no special code here */}

exports.enter = function eneter(filename, lineno) {
  var last = this.trace[this.depth-1] || {};
  filename = filename || last.filename;
  lineno = lineno || last.lineno;
  this.trace.push({filename: filename, lineno: lineno});
}

exports.leave = function leave() {
  this.trace.pop();
}

/**
 * Spawns a new runtime scope by lifting the old one into prototype chain
 * and overriding `buf`, `attributes`, `block` or `self` if necessary.
 * Mixins are lifted too for consistent overriding
 *
 * @param {Object} override
 * @param {Object?} parent
 * @api private
 */

exports.spawn = function spawn(override, parent) {
  if (!override) return this;
  if (!parent) return Object.create(parent = this || exports).spawn(override, parent);
  this.parent = parent;
  this.mixins = Object.create(parent.mixins);
  this.sources = Object.create(parent.sources);
  for (var p in override) this[p] = override[p];
  return this;
}

/**
 * Empty mixin that any mixin-name resolves to for null
 *
 * @api private
 */
function nullMixin(){}

/**
 * Resolve mixin `name` for object `self`
 *
 * @param {*} self
 * @param {String} name
 * @return {Function}
 */
exports.resolveMixin = function resolveMixin(selfArg, name, attrs) {

  // explicitly resolve all mixin names to empty mixin for null selfArg
  if (selfArg === null) return nullMixin;

  // resolving a mixin
  var ctor   = selfArg != null && selfArg.constructor;
  var mixins = ctor && ctor.jade_mixins;
  var mixin  = mixins && mixins[name];
  if (!mixin) throw new Error('Can\'t resolve mixin "' + name + '" for ' + selfArg);

  // if extra attributes should be provided (attrs != null)
  // then try obtain them via constructor
  if (attrs && ctor.jadeAttributes) {
    ctor.jadeAttributes.call(selfArg, name, mixin, attrs);
  }

  return mixin;
}

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};
