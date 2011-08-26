
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
  var filename = options.filename;
  
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
      : 'undefined'
    , fn;

  if (options.compileDebug !== false) {
    // Reduce closure madness by injecting some locals
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

  fn = new Function('locals, attrs, escape, rethrow', fn);
  return function(locals){
    return fn(locals, runtime.attrs, runtime.escape, runtime.rethrow);
  };
};
