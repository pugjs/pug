
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
  , runtime = require('./runtime')
// if node
  , fs = require('fs');
// end

/**
 * Library version.
 */

exports.version = '0.14.2';

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
 * Jade runtime helpers.
 */

exports.runtime = runtime;

/**
 * Parse the given `str` of jade and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api private
 */

function parse(str, options){
  var filename = options.filename
    , inline = false !== options.inline
    , inlined = '';
  
  if (inline) {
    inlined += runtime.attrs.toString() + '\n';
    inlined += runtime.escape.toString() + '\n';
  } else {
    inlined = 'var attrs = jade.attrs, escape = jade.escape;\n';
  }
  
  try {
    // Parse
    var parser = new Parser(str, filename, options);
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
        + inlined
        + 'var buf = [];\n'
        + (options.self
          ? 'var self = locals || {}, __ = __ || locals.__;\n' + js
          : 'with (locals || {}) {\n' + js + '\n}\n')
        + 'return buf.join("");';
      
    } catch (err) {
      process.compile(js, filename || 'Jade');
      return;
    }
  } catch (err) {
    runtime.rethrow(err, str, filename, parser.lexer.lineno);
  }
}

/**
 * Compile a `Function` representation of the given jade `str`.
 *
 * Options:
 * 
 *   - `compileDebug` when `false` debugging code is stripped from the compiled template
 *   - `inline` when `false` helpers are not inlined, and `jade.<helper>` is used
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compile = function(str, options){
  var options = options || {}
    , input = JSON.stringify(str)
    , inline = false !== options.inline
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined'
    , inlined = ''
    , fn;
  
  if (inline) {
    inlined = runtime.rethrow.toString();
  } else {
    inlined = 'var rethrow = jade.rethrow;';
  }

  if (options.compileDebug !== false) {
    // Reduce closure madness by injecting some locals
    fn = [
        'var __ = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };'
      , inlined
      , 'try {'
      , parse(String(str), options || {})
      , '} catch (err) {'
      , '  rethrow(err, __.input, __.filename, __.lineno);'
      , '}'
    ].join('\n');
  } else {
    fn = parse(String(str), options || {});
  }
  
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
    runtime.rethrow(err, str, filename, meta.lineno);
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
  var ret;

  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options.filename = path;

  // Primed cache
  if (options.cache && cache[path]) {
    try {
      ret = exports.render('', options);
    } catch (err) {
      return fn(err);
    }
    fn(null, ret);
  } else {
    fs.readFile(path, 'utf8', function(err, str){
      if (err) return fn(err);
      try {
        ret = exports.render(str, options);
      } catch (err) {
        return fn(err);
      }
      fn(null, ret);
    });
  }
};