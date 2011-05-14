
/*!
 * Jade
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , Compiler = require('./compiler')
// if node
  , fs = require('fs');
// end

/**
 * Library version.
 */

exports.version = '0.11.0';

/**
 * Intermediate JavaScript cache.
 */

var cache = exports.cache = {};

/**
 * Expose self closing tags.
 */

exports.selfClosing = require('./self-closing');

/**
 * Default supported doctypes.
 */

exports.doctypes = require('./doctypes');

/**
 * Text filters.
 */

exports.filters = require('./filters');

/**
 * Utilities.
 */

exports.utils = require('./utils');

/**
 * Expose `Compiler`.
 */

exports.Compiler = Compiler;

/**
 * Expose `Parser`.
 */

exports.Parser = Parser;

/**
 * Nodes.
 */

exports.nodes = require('./nodes');

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function attrs(obj){
  var buf = []
    , terse = obj.terse;
  delete obj.terse;
  var keys = Object.keys(obj)
    , len = keys.length;
  if (len) {
    buf.push('');
    for (var i = 0; i < len; ++i) {
      var key = keys[i]
        , val = obj[key];
      if (typeof val === 'boolean' || val === '' || val == null) {
        if (val) {
          terse
            ? buf.push(key)
            : buf.push(key + '="' + key + '"');
        }
      } else {
        buf.push(key + '="' + escape(val) + '"');
      }
    }
  }
  return buf.join(' ');
}

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Re-throw the given `err` in context to the
 * `str` of jade, `filename`, and `lineno`.
 *
 * @param {Error} err
 * @param {String} str
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

function rethrow(err, str, filename, lineno){
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
}

/**
 * Parse the given `str` of jade and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api private
 */

function parse(str, options){
  var filename = options.filename;
  try {
    // Parse
    var parser = new Parser(str, filename);
    if (options.debug) parser.debug();

    // Compile
    var compiler = new (options.compiler || Compiler)(parser.parse(), options)
      , js = compiler.compile();

    // Debug compiler
    if (options.debug) {
      console.log('\n\x1b[1mCompiled Function\x1b[0m:\n\n%s', js.replace(/^/gm, '  '));
    }

    try {
      return ''
        + attrs.toString() + '\n\n'
        + escape.toString()  + '\n\n'
        + 'var buf = [];\n'
        + (options.self
          ? 'var self = locals || {}, __ = locals.__;\n' + js
          : 'with (locals || {}) {' + js + '}')
        + 'return buf.join("");';
    } catch (err) {
      process.compile(js, filename || 'Jade');
      return;
    }
  } catch (err) {
    rethrow(err, str, filename, parser.lexer.lineno);
  }
}

/**
 * Compile a `Function` representation of the given jade `str`.
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compile = function(str, options){
  var options = options || {}
    , input = JSON.stringify(str)
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined';

  // Reduce closure madness by injecting some locals
  var fn = [
      'var __ = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };'
    , rethrow.toString()
    , 'try {'
    , parse(String(str), options || {})
    , '} catch (err) {'
    , '  rethrow(err, __.input, __.filename, __.lineno);'
    , '}'
  ].join('\n');

  return new Function('locals', fn);
};

/**
 * Render the given `str` of jade.
 *
 * Options:
 *
 *   - `scope`     Evaluation scope (`this`)
 *   - `locals`    Local variable object
 *   - `filename`  Used in exceptions, and required by `cache`
 *   - `cache`     Cache intermediate JavaScript in memory keyed by `filename`
 *   - `compiler`  Compiler to replade jade's default
 *   - `doctype`   Specify the default doctype
 *
 * @param {String|Buffer} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

exports.render = function(str, options){
  var fn
    , options = options || {}
    , filename = options.filename;

  // Accept Buffers
  str = String(str);

  // Cache support
  if (options.cache) {
    if (filename) {
      if (cache[filename]) {
        fn = cache[filename];
      } else {
        fn = cache[filename] = new Function('locals', parse(str, options));
      }
    } else {
      throw new Error('filename is required when using the cache option');
    }
  } else {
    fn = new Function('locals', parse(str, options));
  }

  // Render the template
  try {
    var locals = options.locals || {}
      , meta = { lineno: 1 };
    locals.__ = meta;
    return fn.call(options.scope, locals); 
  } catch (err) {
    rethrow(err, str, filename, meta.lineno);
  }
};

/**
 * Render jade template at the given `path`.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options.filename = path;

  // Primed cache
  if (options.cache && cache[path]) {
    try {
      fn(null, exports.render('', options));
    } catch (err) {
      fn(err);
    }
  } else {
    fs.readFile(path, 'utf8', function(err, str){
      if (err) return fn(err);
      try {
        fn(null, exports.render(str, options));
      } catch (err) {
        fn(err);
      }
    });
  }
};
