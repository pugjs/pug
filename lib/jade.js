'use strict';

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
  , fs = require('fs')
  , ReadableStream = require('stream').Readable
  , ty = require('then-yield')
  , Promise = require('promise');

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
 * @return {String}
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
      console.error('\nCompiled Function:\n\n\u001b[90m%s\u001b[0m', js.replace(/^/gm, '  '));
    }

    var globals = options.globals && Array.isArray(options.globals) ? options.globals : [];

    globals.push('jade');
    globals.push('jade_mixins');
    globals.push('jade_interp');
    globals.push('jade_debug');
    globals.push('buf');

    if (options.streaming) {

    // addWith parses the compiled javascript with uglify-js
    // which does not support function* and yield operators
    var uglify_hack = js
    uglify_hack = uglify_hack.replace(/function\*/g, 'function');
    uglify_hack = uglify_hack.replace(/yield\*?/g, '');
    return ''
      + 'var buf = pushable;\n'
      + 'var jade_mixins = {};\n'
      + (options.self
        ? 'var self = locals || {};\n' + js
        : (addWith('locals || {}', '\n' + uglify_hack, globals)).replace(uglify_hack, js)) + ';';

    } else {
    
    return ''
      + 'var buf = [];\n'
      + 'var jade_mixins = {};\n'
      + 'var jade_interp;\n'
      + (options.self
        ? 'var self = locals || {};\n' + js
        : addWith('locals || {}', '\n' + js, globals)) + ';'
      + 'return buf.join("");';

    }
  } catch (err) {
    parser = parser.context();
    runtime.rethrow(err, parser.filename, parser.lexer.lineno, parser.input);
  }
}

/**
 * Compile a `Function` representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false` and to resolve imports/extends
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compile = function(str, options){
  var options = options || {}
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined'
    , fn;

  str = String(str);

  if (options.streaming) {
    console.error('`streaming` is a reserved keyword. You cannot use it as a compile option attribute');
    delete options.streaming;
  }

  if (options.compileDebug !== false) {
    fn = [
        'var jade_debug = [{ lineno: 1, filename: ' + filename + ' }];'
      , 'try {'
      , parse(str, options)
      , '} catch (err) {'
      , '  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno' + (options.compileDebug === true ? ',' + JSON.stringify(str) : '') + ');'
      , '}'
    ].join('\n');
  } else {
    fn = parse(str, options);
  }

  fn = new Function('locals, jade', fn);
  var res = function(locals){ return fn(locals, Object.create(runtime)) };

  if (options.client) {
    res.toString = function () {
      var err = new Error('The `client` option is deprecated, use `jade.compileClient`');
      console.error(err.stack || err.message);
      return exports.compileClient(str, options);
    };
  }
  return res;
};

/**
 * Compile a JavaScript source representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
       the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *
 * @param {String} str
 * @param {Options} options
 * @return {String}
 * @api public
 */

exports.compileClient = function(str, options){
  var options = options || {}
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined'
    , fn;

  str = String(str);

  if (options.compileDebug) {
    options.compileDebug = true;
    fn = [
        'var jade_debug = [{ lineno: 1, filename: ' + filename + ' }];'
      , 'try {'
      , parse(str, options)
      , '} catch (err) {'
      , '  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ' + JSON.stringify(str) + ');'
      , '}'
    ].join('\n');
  } else {
    options.compileDebug = false;
    fn = parse(str, options);
  }

  return 'function template(locals) {\n' + fn + '\n}';
};

/**
 * Compile a `GeneratorFunction` representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *   - `filename` used to improve errors when `compileDebug` is not `false` and to resolve imports/extends
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compileStreaming = function(str, options){
  var options = options || {}
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined'
    , fn;

  str = String(str);

  if (options.streaming) {
    console.error('`streaming` is a reserved keyword. You cannot use it as a compile option attribute');
  }
  options.streaming = true;

  if (options.compileDebug !== false) {
    fn = [
        'var jade_debug = [{ lineno: 1, filename: ' + filename + ' }];'
      , 'try {'
      , parse(str, options)
      , '} catch (err) {'
      , '  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno' + (options.compileDebug === true ? ',' + JSON.stringify(str) : '') + ');'
      , '}'
    ].join('\n');
  } else {
    fn = parse(str, options);
  }

  // get a generator function that takes `(locals, jade, pushable)`
  fn = new Function ('return function* (locals, jade, pushable) {' + fn + '}')();
  
  // convert it to a function that takes `locals` and returns a readable stream
  return function (locals) {
    var stream = new ReadableStream();
    
    // streaming will be set to false whenever there is back-pressure
    var streaming = false;

    function release() {
      streaming = true;
    }

    // make sure _read is always implemented
    stream._read = release;

    // then-yield unwrap function
    // which implements the backpressure pause mechanism
    function unwrap(value) {
      if (streaming) return value;
      return new Promise(function(resolve) {
        stream._read = function() {
          release();
          this._read = release;
          resolve(value);
        }
      });
    }

    var wrapped = ty.async(fn, Promise.cast, unwrap);
    
    // call our function, setting `streaming` to `false` whenever
    // the buffer is full and there is back-pressure
    var result = wrapped(locals, runtime, {
      push: function (chunk) {
        if (!stream.push(chunk.toString())) streaming = false;
      }
    });

    // once the function completes, we end the stream by pushing `null`
    if (result)
      result.then(stream.push.bind(stream, null), stream.emit.bind(stream, 'error'));
    else
      stream.push(null);

    return stream;

  };

  return res;
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
 * Compile a Jade file at the given `path` for use on the client.
 *
 * @param {String} path
 * @param {Object} options
 * @returns {String}
 * @api public
 */

exports.compileFileClient = function(path, options){
  options = options || {};

  var key = path + ':string';

  options.filename = path;
  var str = options.cache
    ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
    : fs.readFileSync(path, 'utf8');

  return exports.compileClient(str, options);
};

/**
 * Express support.
 */

exports.__express = exports.renderFile;
