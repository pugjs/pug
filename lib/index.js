'use strict';

/*!
 * Jade
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var resolve = require('resolve').sync;
var lex = require('jade-lexer');
var stripComments = require('jade-strip-comments');
var parse = require('jade-parser');
var load = require('jade-load');
var filters = require('jade-filters');
var link = require('jade-linker');
var generateCode = require('jade-code-gen');
var runtime = require('jade-runtime');
var runtimeWrap = require('jade-runtime/wrap');

/**
 * Jade runtime helpers.
 */

exports.runtime = runtime;

/**
 * Template function cache.
 */

exports.cache = {};

/**
 * Object for custom filters
 */
exports.filters = {};

/**
 * Compile the given `str` of jade and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api private
 */

function compileBody(str, options){
  var debug_sources = {};
  debug_sources[options.filename] = str;
  var dependencies = [];
  var plugins = options.plugins || [];
  plugins = plugins.map(function (plugin) {
    if (typeof plugin === 'string') {
      var opts = {
        basedir: path.dirname(module.parent.filename)
      };
      // Test if plugin name is local (i.e. `./my-plugin`)
      // Regex from https://github.com/substack/node-resolve/blob/5cae82fb22cb64d5b72f703c787dc0fd418ed412/lib/sync.js#L21
      if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[\\\/])/.test(plugin)) {
        return require(resolve(plugin, opts))();
      } else {
        return require(resolve('jade-plugin-' + plugin, opts))();
      }
    }
    return plugin;
  });

  try {
    var ast = load.string(str, options.filename, {
      lex: function (str, filename) {
        getPlugin('preLex').forEach(function (func) {
          str = func(str);
        });
        var tokens = lex(str, filename, {
          plugins: getPlugin('lex')
        });
        getPlugin('postLex').forEach(function (func) {
          tokens = func(tokens);
        });
        return tokens;
      },
      parse: function (tokens, filename) {
        getPlugin('preParse').forEach(function (func) {
          tokens = func(tokens);
        });
        tokens = stripComments(tokens, { filename: filename });
        var ast = parse(tokens, filename, {
          plugins: getPlugin('parse')
        });
        getPlugin('postParse').forEach(function (func) {
          ast = func(ast);
        });

        getPlugin('preLoad').forEach(function (func) {
          ast = func(ast);
        });
        return ast;
      },
      resolve: function (filename, source) {
        var plugins = getPlugin('loadResolve');
        for (var i = 0; i < plugins.length; i++) {
          var result = plugins[i](filename, source, options);
          if (result) return result;
        }
        filename = filename.trim();
        if (filename[0] !== '/' && !source)
          throw new Error('the "filename" option is required to use includes and extends with "relative" paths');

        if (filename[0] === '/' && !options.basedir)
          throw new Error('the "basedir" option is required to use includes and extends with "absolute" paths');

        filename = path.join(filename[0] === '/' ? options.basedir : path.dirname(source), filename);

        if (path.basename(filename).indexOf('.') === -1) filename += '.jade';

        return filename;
      },
      read: function (filename) {
        var str;
        var plugins = getPlugin('loadRead');
        for (var i = 0; i < plugins.length; i++) {
          str = plugins[i](filename, source, options, dependencies);
          if (str) {
            debug_sources[filename] = str;
            return str;
          }
        }
        dependencies.push(filename);
        str = fs.readFileSync(filename, 'utf8');
        debug_sources[filename] = str;
        return str;
      }
    });
    getPlugin('postLoad').forEach(function (func) {
      ast = func(ast);
    });

    ast = filters.handleFilters(ast, exports.filters);

    getPlugin('preLink').forEach(function (func) {
      ast = func(ast);
    });
    ast = link(ast, {
      plugins: plugins
    });
    getPlugin('postLink').forEach(function (func) {
      ast = func(ast);
    });

    getPlugin('preCodeGen').forEach(function (func) {
      ast = func(ast);
    });
    // Compile
    var js = generateCode(ast, {
      pretty: options.pretty,
      compileDebug: options.compileDebug,
      doctype: options.doctype,
      inlineRuntimeFunctions: options.inlineRuntimeFunctions,
      globals: options.globals,
      self: options.self,
      includeSources: options.includeSources ? debug_sources : false,
      templateName: options.templateName
    });
    getPlugin('postCodeGen').forEach(function (func) {
      js = func(js);
    });

    // Debug compiler
    if (options.debug) {
      console.error('\nCompiled Function:\n\n\u001b[90m%s\u001b[0m', js.replace(/^/gm, '  '));
    }

    return {body: js, dependencies: dependencies};
  } catch (err) {
    if (err.code && typeof err.code === 'string' && err.code.substr(0, 4) === 'JADE') {
      runtime.rethrow(
        new Error(err.msg),
        err.filename,
        err.line,
        options.filename === err.filename ? str : (options.compileDebug ? debug_sources[err.filename] : undefined)
      );
    }
    throw err;
  }

  function getPlugin(hook) {
    var out = [];
    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i][hook]) {
        out.push(plugins[i][hook]);
      }
    }
    return out;
  }
}

/**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `str` is not set, the file specified in `options.filename` will be read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @param {Object} options
 * @param {String=} str
 * @return {Function}
 * @api private
 */
function handleTemplateCache (options, str) {
  var key = options.filename;
  if (options.cache && exports.cache[key]) {
    return exports.cache[key];
  } else {
    if (str === undefined) str = fs.readFileSync(options.filename, 'utf8');
    var templ = exports.compile(str, options);
    if (options.cache) exports.cache[key] = templ;
    return templ;
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

  str = String(str);

  var parsed = compileBody(str, {
    compileDebug: options.compileDebug !== false,
    filename: options.filename,
    basedir: options.basedir,
    pretty: options.pretty,
    doctype: options.doctype,
    inlineRuntimeFunctions: options.inlineRuntimeFunctions,
    globals: options.globals,
    self: options.self,
    includeSources: options.compileDebug === true,
    debug: options.debug,
    templateName: 'template',
    plugins: options.plugins
  });

  var res = options.inlineRuntimeFunctions
    ? new Function('', parsed.body + ';return template;')()
    : runtimeWrap(parsed.body);

  res.dependencies = parsed.dependencies;

  return res;
};

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
 * @return {Object}
 * @api public
 */

exports.compileClientWithDependenciesTracked = function(str, options){
  var options = options || {};

  str = String(str);
  var parsed = compileBody(str, {
    compileDebug: options.compileDebug,
    filename: options.filename,
    basedir: options.basedir,
    pretty: options.pretty,
    doctype: options.doctype,
    inlineRuntimeFunctions: options.inlineRuntimeFunctions !== false,
    globals: options.globals,
    self: options.self,
    includeSources: options.compileDebug,
    debug: options.debug,
    templateName: options.name || 'template',
    plugins: options.plugins
  });

  return {body: parsed.body, dependencies: parsed.dependencies};
};

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
exports.compileClient = function (str, options) {
  return exports.compileClientWithDependenciesTracked(str, options).body;
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
  options.filename = path;
  return handleTemplateCache(options);
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

  return handleTemplateCache(options, str)(options);
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

  options.filename = path;
  return handleTemplateCache(options)(options);
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
  var key = path + ':client';
  options = options || {};

  options.filename = path;

  if (options.cache && exports.cache[key]) {
    return exports.cache[key];
  }

  var str = fs.readFileSync(options.filename, 'utf8');
  var out = exports.compileClient(str, options);
  if (options.cache) exports.cache[key] = out;
  return out;
};

/**
 * Express support.
 */

exports.__express = function(path, options, fn) {
  if(options.compileDebug == undefined && process.env.NODE_ENV === 'production') {
    options.compileDebug = false;
  }
  exports.renderFile(path, options, fn);
}
