
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

exports.version = '0.15.3';

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
  var filename = options.filename;
  
  try {
    // Parse
    var parser = new Parser(str, filename, options);

    // Compile
    var compiler = new (options.compiler || Compiler)(parser.parse(), options)
      , js = compiler.compile();

    // Debug compiler
    if (options.debug) {
      console.log('\n\x1b[1mCompiled Function\x1b[0m:\n\n%s', js.replace(/^/gm, '  '));
    }

    try {
      return ''
        + 'var buf = [];\n'
        + (options.self
          ? 'var self = locals || {};\n' + js
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
 *   - `client` when `true` the helper functions `escape()` etc will reference `jade.escape()`
 *      for use with the Jade client-side runtime.js
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compile = function(str, options){
  var options = options || {}
    , input = JSON.stringify(str)
    , client = options.client
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined'
    , fn;

  if (options.compileDebug !== false) {
    fn = [
        'var __ = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };'
      , 'try {'
      , parse(String(str), options || {})
      , '} catch (err) {'
      , '  rethrow(err, __.input, __.filename, __.lineno);'
      , '}'
    ].join('\n');
  } else {
    fn = parse(String(str), options || {});
  }

  if (client) {
    fn = 'var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;\n' + fn;
  }

  fn = new Function('locals, attrs, escape, rethrow', fn);

  if (client) return fn;

  return function(locals){
    return fn(locals, runtime.attrs, runtime.escape, runtime.rethrow);
  };
};
