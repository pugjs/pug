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
  , utils = require('./utils')
  , nodes = require('./nodes');

/**
 * Expose self closing tags.
 */

exports.selfClosing = require('void-elements');

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

exports.nodes = nodes;

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
 * @return {Object}
 * @api private
 */

function parse(str, options){

  if (options.compileDebug === true) {
    options.sourceStr = str;
  }

  // Parse
  var parser = new (options.parser || Parser)(str, options.filename, options);
  var block;
  try {
    // Parse
    block = parser.parse();
  } catch (err) {
    parser = parser.context();
    runtime.rethrow(err, parser.filename, parser.lexer.lineno, parser.input);
  }

  var node = options.mixin ? parser.blockToMixinLiteral(block, true) : block;

  // Compile
  var compiler = new (options.compiler || Compiler)(node, options);
  var js;
  try {
    // Compile
    js = compiler.compile();
  } catch (err) {
    if (err.line && (err.filename || !options.filename)) {
      runtime.rethrow(err, err.filename, err.line, parser.input);
    } else {
      throw err;
    }
  }

  // Debug compiler
  if (options.debug) {
    console.error('\nCompiled Function:\n\n\u001b[90m%s\u001b[0m', js.replace(/^/gm, '  '));
  }

  var body;
  var globals = ['jade', 'jade_parent', 'undefined']
  var pp = options.pretty ? 'jade.indent = [];\n' : '';

  function dbg(actions) {
    if (options.compileDebug === false) return actions;
    if (options.compileDebug === true) {
      var filename = utils.stringify(options.filename || "*");
      actions = 'jade.sources['+ filename +']='
        + utils.stringify(str) + ';\n'
        + actions;
    }
    actions = 'try {\n'
      + actions
      + '} catch(err) {\n'
      + '  var last = jade.trace.pop() || {};\n'
      + '  var filename = last.filename || "*";\n'
      + '  jade.rethrow(err, last.filename, last.lineno, jade.sources[filename]);\n'
      + '}\n'
    return actions;
  }

  if (options.mixin) {
    body = addWith('locals', pp + 'return ' + js, globals) + ';';
  } else {
    var actions = options.self
      ? 'var self = locals;\n' + js
      : addWith('locals', '\n' + js, globals) + ';'
    ;
    body = 'return function(locals){\n'
      + 'var buf = [];\n'
      + 'var jade = jade_parent.spawn({emit:function(chunk){buf.push(chunk)}});\n'
      + 'locals = locals ? Object.create(locals) : {};'
      + pp
      + dbg(actions)
      + 'return buf.join("");'
      + '}';
  }

  return {body: body, dependencies: parser.dependencies};
}

/**
 * Compile a `Function` representation of the given jade `str` as `MixinLiteral`.
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compileMixin = function(str, options){
  var options = Object.create(options || {});
  options.self = true;
  options.mixin = true;
  str = String(str);
  var parsed = parse(str, options);
  var locals = Object.create(options.locals || {});
  var make = new Function('locals,jade', parsed.body);
  var res = make(locals, options.runtime || runtime);
  res.dependencies = parsed.dependencies;
  res.locals = locals;
  return res;
};


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
  var options = options || {};
  str = String(str);
  var parsed = parse(str, options);
  var make = new Function('jade_parent', parsed.body);
  var res = make(options.runtime || runtime);
  if (options.client) {
    res.toString = function () {
      var err = new Error('The `client` option is deprecated, use the `jade.compileClient` method instead');
      err.name = 'Warning';
      console.error(err.stack || err.message);
      return exports.compileClient(str, options);
    };
  }
  res.dependencies = parsed.dependencies;
  return res;
};

var bare_runtime = function(){
  var placeholder = '*';
  var rt = { attributes: [], block: null, self: null, mixins: {}, debug:[], spawn: placeholder, sources:{} };
  var spawn = runtime.spawn.toString().replace('exports','{}');
  return utils.stringify(rt).replace(utils.stringify(placeholder),spawn);
}();

/**
 * Compile a JavaScript source representation of the given jade `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *
 * @param {String} str
 * @param {Options} options
 * @return {String}
 * @api public
 */

exports.compileClient = function(str, options){
  var options = options || {};
  var name = options.name || 'template';
  var compiled = name + '.jade'
  str = String(str);
  options.compileDebug = Boolean(options.compileDebug); // make it explicitly true or false;
  var parsed = parse(str, options);
  return 'function ' + name + '(locals){\n'
       + ' if (!' + compiled + ') '
       + compiled
       + ' = function(jade_parent){\n'
       + parsed.body
       + '\n}(typeof jade !== "undefined" ? jade : ' + bare_runtime +');\n'
       + ' return ' + compiled + '.call(this,locals);\n'
       + '}';
};

/**
 * Compile a `Function` representation of the given jade file.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *
 * @param {String} path
 * @param {Options} options
 * @return {Function}
 * @api public
 */
exports.compileFile = function (path, options) {
  options = options || {};

  var key = path + ':string';

  options.filename = path;
  var str = options.cache
    ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
    : fs.readFileSync(path, 'utf8');

  return options.cache
    ? exports.cache[path] || (exports.cache[path] = exports.compile(str, options))
    : exports.compile(str, options);
};


/**
 * Compile a `Function` representation of the given jade file as `MixinLiteral`.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled
       template, when it is explicitly `true`, the source code is included in
       the compiled template for better accuracy.
 *
 * @param {String} path
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compileMixinFile = function (path, options) {
  options = Object.create(options || {});

  var key = path + ':string';

  options.filename = path;
  var str = options.cache
    ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
    : fs.readFileSync(path, 'utf8');

  return options.cache
    ? exports.cache[path] || (exports.cache[path] = exports.compileMixin(str, options))
    : exports.compileMixin(str, options);
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
