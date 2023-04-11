#!/usr/bin/env node

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const program = require("commander");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'mkdirp'.
const mkdirp = require("mkdirp");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const chalk = require("chalk");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("pug");

// @ts-expect-error TS(2339): Property 'basename' does not exist on type 'string... Remove this comment to see the full error message
const basename = path.basename;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dirname'.
const dirname = path.dirname;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'resolve'.
const resolve = path.resolve;
const normalize = path.normalize;
// @ts-expect-error TS(2339): Property 'join' does not exist on type 'string'.
const join = path.join;
// @ts-expect-error TS(2339): Property 'relative' does not exist on type 'string... Remove this comment to see the full error message
const relative = path.relative;

// Pug options

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'options'.
let options = {};

// options

program
	.version(
		// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
		`pug version: ${require("pug/package.json").version}\n` + `pug-cli version: ${require("./package.json").version}`
	)
	.usage("[options] [dir|file ...]")
	.option("-O, --obj <str|path>", "JSON/JavaScript options object or file")
	.option("-o, --out <dir>", "output the rendered HTML or compiled JavaScript to <dir>")
	.option("-p, --path <path>", "filename used to resolve includes")
	.option("-b, --basedir <path>", "path used as root directory to resolve absolute includes")
	.option("-P, --pretty", "compile pretty HTML output")
	.option("-c, --client", "compile function for client-side")
	.option("-n, --name <str>", "the name of the compiled template (requires --client)")
	.option("-D, --no-debug", "compile without debugging (smaller functions)")
	.option("-w, --watch", "watch files for changes and automatically re-render")
	.option("-E, --extension <ext>", "specify the output file extension")
	.option("-s, --silent", "do not output logs")
	.option(
		"--name-after-file",
		"name the template after the last section of the file path (requires --client and overriden by --name)"
	)
	.option("--doctype <str>", "specify the doctype on the command line (useful if it is not specified by the template)");

program.on("--help", () => {
	console.log("  Examples:");
	console.log("");
	console.log("    # Render all files in the `templates` directory:");
	console.log("    $ pug templates");
	console.log("");
	console.log("    # Create {foo,bar}.html:");
	console.log("    $ pug {foo,bar}.pug");
	console.log("");
	console.log("    # Using `pug` over standard input and output streams");
	console.log("    $ pug < my.pug > my.html");
	console.log("    $ echo 'h1 Pug!' | pug");
	console.log("");
	console.log("    # Render all files in `foo` and `bar` directories to `/tmp`:");
	console.log("    $ pug foo bar --out /tmp");
	console.log("");
	console.log("    # Specify options through a string:");
	console.log('    $ pug -O \'{"doctype": "html"}\' foo.pug');
	console.log("    # or, using JavaScript instead of JSON");
	console.log("    $ pug -O \"{doctype: 'html'}\" foo.pug");
	console.log("");
	console.log("    # Specify options through a file:");
	console.log("    $ echo \"exports.doctype = 'html';\" > options.js");
	console.log("    $ pug -O options.js foo.pug");
	console.log("    # or, JSON works too");
	console.log('    $ echo \'{"doctype": "html"}\' > options.json');
	console.log("    $ pug -O options.json foo.pug");
	console.log("");
});

// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
program.parse(process.argv);

// options given, parse them

if (program.obj) {
	options = parseObj(program.obj);
}

/**
 * Parse object either in `input` or in the file called `input`. The latter is
 * searched first.
 */
function parseObj(input: any) {
	try {
		// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
		return require(path.resolve(input));
	} catch (e) {
		let str;
		try {
			str = fs.readFileSync(program.obj, "utf8");
		} catch (e) {
			str = program.obj;
		}
		try {
			return JSON.parse(str);
		} catch (e) {
			return eval(`(${str})`);
		}
	}
}

[
	["path", "filename"], // --path
	["debug", "compileDebug"], // --no-debug
	["client", "client"], // --client
	["pretty", "pretty"], // --pretty
	["basedir", "basedir"], // --basedir
	["doctype", "doctype"], // --doctype
].forEach((o) => {
	options[o[1]] = program[o[0]] !== undefined ? program[o[0]] : options[o[1]];
});

// --name

if (typeof program.name === "string") {
	options.name = program.name;
}

// --silent

const consoleLog = program.silent ? function () {} : console.log;

// left-over args are file paths

const files = program.args;

// object of reverse dependencies of a watched file, including itself if
// applicable

const watchList = {};

// function for rendering
const render = program.watch ? tryRender : renderFile;

// compile files

if (files.length) {
	consoleLog();
	if (program.watch) {
		// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
		process.on("SIGINT", () => {
			// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
			process.exit(1);
		});
	}
	files.forEach((file: any) => {
		// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
		render(file);
	});
	// stdio
} else {
	stdin();
}

/**
 * Watch for changes on path
 *
 * Renders `base` if specified, otherwise renders `path`.
 */
function watchFile(path: any, base: any, rootPath: any) {
	path = normalize(path);

	let log = `  ${chalk.gray("watching")} ${chalk.cyan(path)}`;
	if (!base) {
		base = path;
	} else {
		base = normalize(base);
		log += `\n    ${chalk.gray("as a dependency of")} `;
		log += chalk.cyan(base);
	}

	// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
	if (watchList[path]) {
		// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		if (watchList[path].indexOf(base) !== -1) return;
		consoleLog(log);
		// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		watchList[path].push(base);
		return;
	}

	consoleLog(log);
	// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
	watchList[path] = [base];
	fs.watchFile(path, { persistent: true, interval: 200 }, (curr: any, prev: any) => {
		// File doesn't exist anymore. Keep watching.
		if (curr.mtime.getTime() === 0) return;
		// istanbul ignore if
		if (curr.mtime.getTime() === prev.mtime.getTime()) return;
		// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		watchList[path].forEach((file: any) => {
			tryRender(file, rootPath);
		});
	});
}

/**
 * Convert error to string
 */
function errorToString(e: any) {
	return e.stack || /* istanbul ignore next */ e.message || e;
}

/**
 * Try to render `path`; if an exception is thrown it is printed to stderr and
 * otherwise ignored.
 *
 * This is used in watch mode.
 */
function tryRender(path: any, rootPath: any) {
	try {
		renderFile(path, rootPath);
	} catch (e) {
		// keep watching when error occured.
		console.error(`${errorToString(e)}\x07`);
	}
}

/**
 * Compile from stdin.
 */

function stdin() {
	let buf = "";
	// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
	process.stdin.setEncoding("utf8");
	// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
	process.stdin.on("data", (chunk: any) => {
		buf += chunk;
	});
	// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
	process.stdin
		.on("end", () => {
			var output;
			if (options.client) {
				output = pug.compileClient(buf, options);
			} else {
				const fn = pug.compile(buf, options);
				var output = fn(options);
			}
			// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
			process.stdout.write(output);
		})
		.resume();
}

/**
 * Process the given path, compiling the pug files found.
 * Always walk the subdirectories.
 *
 * @param path      path of the file, might be relative
 * @param rootPath  path relative to the directory specified in the command
 */

function renderFile(path: any, rootPath: any) {
	const isPug = /\.(?:pug|jade)$/;
	const isIgnored = /([\/\\]_)|(^_)/;

	const stat = fs.lstatSync(path);
	// Found pug file
	if (stat.isFile() && isPug.test(path) && !isIgnored.test(path)) {
		// Try to watch the file if needed. watchFile takes care of duplicates.
		if (program.watch) watchFile(path, null, rootPath);
		if (program.nameAfterFile) {
			options.name = getNameFromFileName(path);
		}
		const fn = options.client ? pug.compileFileClient(path, options) : pug.compileFile(path, options);
		if (program.watch && fn.dependencies) {
			// watch dependencies, and recompile the base
			fn.dependencies.forEach((dep: any) => {
				watchFile(dep, path, rootPath);
			});
		}

		// --extension
		let extname;
		if (program.extension) extname = `.${program.extension}`;
		else if (options.client) extname = ".js";
		else if (program.extension === "") extname = "";
		else extname = ".html";

		// path: foo.pug -> foo.<ext>
		path = path.replace(isPug, extname);
		if (program.out) {
			// prepend output directory
			if (rootPath) {
				// replace the rootPath of the resolved path with output directory
				path = relative(rootPath, path);
			} else {
				// if no rootPath handling is needed
				path = basename(path);
			}
			path = resolve(program.out, path);
		}
		const dir = resolve(dirname(path));
		mkdirp.sync(dir);
		const output = options.client ? fn : fn(options);
		fs.writeFileSync(path, output);
		consoleLog(`  ${chalk.gray("rendered")} ${chalk.cyan("%s")}`, normalize(path));
		// Found directory
	} else if (stat.isDirectory()) {
		const files = fs.readdirSync(path);
		files
			.map((filename: any) => {
				return `${path}/${filename}`;
			})
			.forEach((file: any) => {
				render(file, rootPath || path);
			});
	}
}

/**
 * Get a sensible name for a template function from a file path
 *
 * @param {String} filename
 * @returns {String}
 */
function getNameFromFileName(filename: any) {
	const file = basename(filename).replace(/\.(?:pug|jade)$/, "");
	return `${file.toLowerCase().replace(/[^a-z0-9]+([a-z])/g, (_: any, character: any) => {
		return character.toUpperCase();
	})}Template`;
}
