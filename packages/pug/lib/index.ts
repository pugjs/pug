/*!
 * Pug
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'lex'.
const lex = require("pug-lexer");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'stripComme... Remove this comment to see the full error message
const stripComments = require("pug-strip-comments");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
const parse = require("pug-parser");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const load = require("pug-load");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'filters'.
const filters = require("pug-filters");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'link'.
const link = require("pug-linker");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'generateCo... Remove this comment to see the full error message
const generateCode = require("pug-code-gen");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'runtime'.
const runtime = require("pug-runtime");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const runtimeWrap = require("pug-runtime/wrap");

/**
 * Name for detection
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.name = "Pug";

/**
 * Pug runtime helpers.
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.runtime = runtime;

/**
 * Template function cache.
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.cache = {};

function applyPlugins(value: any, options: any, plugins: any, name: any) {
	return plugins.reduce((value: any, plugin: any) => {
		return plugin[name] ? plugin[name](value, options) : value;
	}, value);
}

function findReplacementFunc(plugins: any, name: any) {
	const eligiblePlugins = plugins.filter((plugin: any) => {
		return plugin[name];
	});

	if (eligiblePlugins.length > 1) {
		throw new Error(`Two or more plugins all implement ${name} method.`);
	} else if (eligiblePlugins.length) {
		return eligiblePlugins[0][name].bind(eligiblePlugins[0]);
	}
	return null;
}

/**
 * Object for global custom filters.  Note that you can also just pass a `filters`
 * option to any other method.
 */
// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.filters = {};

/**
 * Compile the given `str` of pug and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api private
 */

function compileBody(str: any, options: any) {
	const debug_sources = {};
	// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
	debug_sources[options.filename] = str;
	const dependencies: any = [];
	const plugins = options.plugins || [];
	let ast = load.string(str, {
		filename: options.filename,
		basedir: options.basedir,
		lex(str: any, options: any) {
			const lexOptions = {};
			Object.keys(options).forEach((key) => {
				// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				lexOptions[key] = options[key];
			});
			// @ts-expect-error TS(2339): Property 'plugins' does not exist on type '{}'.
			lexOptions.plugins = plugins
				.filter((plugin: any) => {
					return !!plugin.lex;
				})
				.map((plugin: any) => {
					return plugin.lex;
				});
			const contents = applyPlugins(str, { filename: options.filename }, plugins, "preLex");
			return applyPlugins(lex(contents, lexOptions), options, plugins, "postLex");
		},
		parse(tokens: any, options: any) {
			tokens = tokens.map((token: any) => {
				// @ts-expect-error TS(2339): Property 'extname' does not exist on type 'string'... Remove this comment to see the full error message
				if (token.type === "path" && path.extname(token.val) === "") {
					return {
						type: "path",
						loc: token.loc,
						val: `${token.val}.pug`,
					};
				}
				return token;
			});
			tokens = stripComments(tokens, options);
			tokens = applyPlugins(tokens, options, plugins, "preParse");
			const parseOptions = {};
			Object.keys(options).forEach((key) => {
				// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				parseOptions[key] = options[key];
			});
			// @ts-expect-error TS(2339): Property 'plugins' does not exist on type '{}'.
			parseOptions.plugins = plugins
				.filter((plugin: any) => {
					return !!plugin.parse;
				})
				.map((plugin: any) => {
					return plugin.parse;
				});

			return applyPlugins(
				applyPlugins(parse(tokens, parseOptions), options, plugins, "postParse"),
				options,
				plugins,
				"preLoad"
			);
		},
		resolve(filename: any, source: any, loadOptions: any) {
			const replacementFunc = findReplacementFunc(plugins, "resolve");
			if (replacementFunc) {
				return replacementFunc(filename, source, options);
			}

			return load.resolve(filename, source, loadOptions);
		},
		read(filename: any, loadOptions: any) {
			dependencies.push(filename);

			let contents;

			const replacementFunc = findReplacementFunc(plugins, "read");
			if (replacementFunc) {
				contents = replacementFunc(filename, options);
			} else {
				contents = load.read(filename, loadOptions);
			}

			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			debug_sources[filename] = Buffer.isBuffer(contents) ? contents.toString("utf8") : contents;
			return contents;
		},
	});
	ast = applyPlugins(ast, options, plugins, "postLoad");
	ast = applyPlugins(ast, options, plugins, "preFilters");

	const filtersSet = {};
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	Object.keys(exports.filters).forEach((key) => {
		// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		filtersSet[key] = exports.filters[key];
	});
	if (options.filters) {
		Object.keys(options.filters).forEach((key) => {
			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			filtersSet[key] = options.filters[key];
		});
	}
	ast = filters.handleFilters(ast, filtersSet, options.filterOptions, options.filterAliases);

	ast = applyPlugins(ast, options, plugins, "postFilters");
	ast = applyPlugins(ast, options, plugins, "preLink");
	ast = link(ast);
	ast = applyPlugins(ast, options, plugins, "postLink");

	// Compile
	ast = applyPlugins(ast, options, plugins, "preCodeGen");
	let js = (findReplacementFunc(plugins, "generateCode") || generateCode)(ast, {
		pretty: options.pretty,
		compileDebug: options.compileDebug,
		doctype: options.doctype,
		inlineRuntimeFunctions: options.inlineRuntimeFunctions,
		globals: options.globals,
		self: options.self,
		includeSources: options.includeSources ? debug_sources : false,
		templateName: options.templateName,
	});
	js = applyPlugins(js, options, plugins, "postCodeGen");

	// Debug compiler
	if (options.debug) {
		console.error("\nCompiled Function:\n\n\u001b[90m%s\u001b[0m", js.replace(/^/gm, "  "));
	}

	return { body: js, dependencies };
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
function handleTemplateCache(options: any, str: any) {
	const key = options.filename;
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	if (options.cache && exports.cache[key]) {
		// @ts-expect-error TS(2304): Cannot find name 'exports'.
		return exports.cache[key];
	}
	if (str === undefined) str = fs.readFileSync(options.filename, "utf8");
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	const templ = exports.compile(str, options);
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	if (options.cache) exports.cache[key] = templ;
	return templ;
}

/**
 * Compile a `Function` representation of the given pug `str`.
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

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.compile = function (str: any, options: any) {
	var options = options || {};

	str = String(str);

	const parsed = compileBody(str, {
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
		templateName: "template",
		filters: options.filters,
		filterOptions: options.filterOptions,
		filterAliases: options.filterAliases,
		plugins: options.plugins,
	});

	const res = options.inlineRuntimeFunctions
		? new Function("", `${parsed.body};return template;`)()
		: runtimeWrap(parsed.body);

	res.dependencies = parsed.dependencies;

	return res;
};

/**
 * Compile a JavaScript source representation of the given pug `str`.
 *
 * Options:
 *
 *   - `compileDebug` When it is `true`, the source code is included in
 *     the compiled template for better error messages.
 *   - `filename` used to improve errors when `compileDebug` is not `true` and to resolve imports/extends
 *   - `name` the name of the resulting function (defaults to "template")
 *   - `module` when it is explicitly `true`, the source code include export module syntax
 *
 * @param {String} str
 * @param {Options} options
 * @return {Object}
 * @api public
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.compileClientWithDependenciesTracked = function (str: any, options: any) {
	var options = options || {};

	str = String(str);
	const parsed = compileBody(str, {
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
		templateName: options.name || "template",
		filters: options.filters,
		filterOptions: options.filterOptions,
		filterAliases: options.filterAliases,
		plugins: options.plugins,
	});

	let body = parsed.body;

	if (options.module) {
		if (options.inlineRuntimeFunctions === false) {
			body = `var pug = require("pug-runtime");${body}`;
		}
		body += ` module.exports = ${options.name || "template"};`;
	}

	return { body, dependencies: parsed.dependencies };
};

/**
 * Compile a JavaScript source representation of the given pug `str`.
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
// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.compileClient = function (str: any, options: any) {
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	return exports.compileClientWithDependenciesTracked(str, options).body;
};

/**
 * Compile a `Function` representation of the given pug file.
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
// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.compileFile = function (path: any, options: any) {
	options = options || {};
	options.filename = path;
	// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
	return handleTemplateCache(options);
};

/**
 * Render the given `str` of pug.
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

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.render = function (str: any, options: any, fn: any) {
	// support callback API
	if ("function" == typeof options) {
		(fn = options), (options = undefined);
	}
	if (typeof fn === "function") {
		let res;
		try {
			// @ts-expect-error TS(2304): Cannot find name 'exports'.
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
 * Render a Pug file at the given `path`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function|undefined} fn
 * @returns {String}
 * @api public
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.renderFile = function (path: any, options: any, fn: any) {
	// support callback API
	if ("function" == typeof options) {
		(fn = options), (options = undefined);
	}
	if (typeof fn === "function") {
		let res;
		try {
			// @ts-expect-error TS(2304): Cannot find name 'exports'.
			res = exports.renderFile(path, options);
		} catch (ex) {
			return fn(ex);
		}
		return fn(null, res);
	}

	options = options || {};

	options.filename = path;
	// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
	return handleTemplateCache(options)(options);
};

/**
 * Compile a Pug file at the given `path` for use on the client.
 *
 * @param {String} path
 * @param {Object} options
 * @returns {String}
 * @api public
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.compileFileClient = function (path: any, options: any) {
	const key = `${path}:client`;
	options = options || {};

	options.filename = path;

	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	if (options.cache && exports.cache[key]) {
		// @ts-expect-error TS(2304): Cannot find name 'exports'.
		return exports.cache[key];
	}

	const str = fs.readFileSync(options.filename, "utf8");
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	const out = exports.compileClient(str, options);
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	if (options.cache) exports.cache[key] = out;
	return out;
};

/**
 * Express support.
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.__express = function (path: any, options: any, fn: any) {
	// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
	if (options.compileDebug == undefined && process.env.NODE_ENV === "production") {
		options.compileDebug = false;
	}
	// @ts-expect-error TS(2304): Cannot find name 'exports'.
	exports.renderFile(path, options, fn);
};
