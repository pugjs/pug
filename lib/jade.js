/*!
 * Jade
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , Lexer = require('./lexer')
  , Compiler = require('./compiler')
  , runtime = require('./runtime')
  , addWith = require('with')
  , fs = require('fs');

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
 * Expose `Lexer`.
 */

exports.Lexer = Lexer;

/**
 * Nodes.
 */

exports.nodes = require('./nodes');

/**
 * Jade runtime helpers.
 */

exports.runtime = runtime;

/**
 * Template function cache.
 */

exports.cache = {};

/**
 * Parse the given `str` of jade and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object} parse results;
 * @api private
 */

function parse(str, options){
  try {
    // Parse
    var parser = new (options.parser || Parser)(str, options.filename, options);

    // Compile
    var compiler = new (options.compiler || Compiler)(parser.parse(), options)
      , js = compiler.compile();

    // Debug compiler
    if (options.debug) {
      console.error('\nCompiled Function:\n\n\033[90m%s\033[0m', js.replace(/^/gm, '  '));
    }

    var globals = options.globals && Array.isArray(options.globals) ? options.globals : [];

    globals.push('jade');
    globals.push('jade_debug');
    globals.push('buf');

    var parsed = ''
      + 'var buf = [];\n'
      + (options.self
        ? 'var self = locals || {};\n' + js
        : addWith('locals || {}', js, globals)) + ';'
      + 'return buf.join("");';
    return {
      parsed: parsed,
      dependencies: parser.files,
      source: str
    };
  } catch (err) {
    parser = parser.context();
    runtime.rethrow(err, parser.filename, parser.lexer.lineno, parser.input);
  }
}

/**
 * Compile the function body created by `parse` into a function.
 *
 * @param {Object} parseResult
 * @param {Object} options
 * @returns {Function}
 * @api private
 */
function compile(parseResult, options) {
  var fn
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined';
  if (options.compileDebug !== false) {
    fn = [
        'var jade_debug = [{ lineno: 1, filename: ' + filename + ' }];'
      , 'try {'
      , parseResult.parsed
      , '} catch (err) {'
      , '  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno' + (options.compileDebug === true ? ',' + JSON.stringify(parseResult.source) : '') + ');'
      , '}'
    ].join('\n');
  } else {
    fn = parseResult.parsed;
  }

  if (options.client) return new Function('locals', fn)
  fn = new Function('locals, jade', fn)
  return function(locals){ return fn(locals, Object.create(runtime)) }
}

/**
 * Resolve dependencies of a given jade 'str'.
 *
 * Info:
 *
 *    - `dependencies` A tree of template filenames and their dependendent
        filenames. If `options.filename` is specified the tree is rooted at
        that filename.
 *    - `fn` the compiled function otherwise returned by `compile`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
        template, when it is explicitly `true`, the source code is included in
        the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false`
 *
 * @param {String} str
 * @param {Options} options
 * @returns {Info}
 * @api public
 */
exports.resolve = function(str, options) {
  options = options || {};

  str = String(str);

  var parseResult = parse(str, options);
  var info = {
    fn: compile(parseResult, options)
  };
  if( options.filename ) {
    info.dependencies = {};
    info.dependencies[options.filename] = parseResult.dependencies;
  } else {
    info.dependencies = parseResult.dependencies
  }
  return info;
};

/**
 * Compile a `Function` representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false`
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compile = function(str, options){
  options = options || {};

  str = String(str);

  var parseResult = parse(str, options);
  return compile(parseResult, options);
};

/**
 * Render the given `str` of jade.
 *
 * Options:
 *
 *   - `cache` enable template caching
 *   - `filename` filename required for `include` / `extends` and caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */

exports.render = function(str, options, fn){
  // support callback API
  if ('function' == typeof options) {
    fn = options, options = undefined;
  }
  if (typeof fn === 'function') {
    var res
    try {
      res = exports.render(str, options);
    } catch (ex) {
      return fn(ex);
    }
    return fn(null, res);
  }

  options = options || {};

  // cache requires .filename
  if (options.cache && !options.filename) {
    throw new Error('the "filename" option is required for caching');
  }

  var path = options.filename;
  var tmpl = options.cache
    ? exports.cache[path] || (exports.cache[path] = exports.compile(str, options))
    : exports.compile(str, options);
  return tmpl(options);
};

/**
 * Render a Jade file at the given `path`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */

exports.renderFile = function(path, options, fn){
  // support callback API
  if ('function' == typeof options) {
    fn = options, options = undefined;
  }
  if (typeof fn === 'function') {
    var res
    try {
      res = exports.renderFile(path, options);
    } catch (ex) {
      return fn(ex);
    }
    return fn(null, res);
  }

  options = options || {};

  var key = path + ':string';

  options.filename = path;
  var str = options.cache
    ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
    : fs.readFileSync(path, 'utf8');
  return exports.render(str, options);
};

/**
 * Express support.
 */

exports.__express = exports.renderFile;
