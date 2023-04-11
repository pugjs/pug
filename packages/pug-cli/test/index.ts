// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const cp = require("child_process");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'mkdirp'.
const mkdirp = require("mkdirp");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const rimraf = require("rimraf");

// Sets directory to output coverage data to
// Incremented every time getRunner() is called.
let covCount = 1;
// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const isIstanbul = process.env.running_under_istanbul;

/*
 * I/O utilities for temporary directory.
 */
function j(paths: any) {
	// @ts-expect-error TS(2339): Property 'join' does not exist on type 'string'.
	return path.join.apply(path, paths);
}

function t(paths: any) {
	paths = Array.isArray(paths) ? paths : [paths];
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const args = [__dirname, "temp"].concat(paths);
	return j(args);
}

function r(paths: any) {
	return fs.readFileSync(t(paths), "utf8");
}

function rs(paths: any) {
	return fs.createReadStream(t(paths));
}

function w(paths: any, content: any) {
	return fs.writeFileSync(t(paths), content);
}

function a(paths: any, content: any) {
	return fs.appendFileSync(t(paths), content);
}

function u(paths: any) {
	return fs.unlinkSync(t(paths));
}

/**
 * Gets an array containing the routine to run the pug CLI. If this file is
 * being processed with istanbul then this function will return a routine
 * asking istanbul to store coverage data to a unique directory
 * (cov-pt<covCount>/).
 */
function getRunner() {
	// @ts-expect-error TS(2304): Cannot find name '__dirname'.
	const pugExe = j([__dirname, "..", "index.js"]);

	// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
	if (!isIstanbul) return [process.argv[0], [pugExe]];

	return [
		"istanbul",
		[
			"cover",
			"--print",
			"none",
			"--report",
			"none",
			"--root",
			// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
			process.cwd(),
			"--dir",
			// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
			`${process.cwd()}/cov-pt${covCount++}`,
			pugExe,
			"--",
		],
	];
}

/*
 * Run Pug CLI.
 *
 * @param  args     Array of arguments
 * @param [stdin]   Stream of standard input
 * @param  callback Function to call when the process finishes
 */
function run(args: any, stdin: any, callback: any) {
	if (arguments.length === 2) {
		callback = stdin;
		stdin = null;
	}
	const runner = getRunner();
	const proc = cp.execFile(
		runner[0],
		runner[1].concat(args),
		{
			cwd: t([]),
		},
		callback
	);
	if (stdin) stdin.pipe(proc.stdin);
}

/**
 * Set timing limits for a test case
 */
function timing(testCase: any) {
	if (isIstanbul) {
		testCase.timeout(20000);
		testCase.slow(3000);
	} else {
		testCase.timeout(12500);
		testCase.slow(2000);
	}
}

/*
 * Make temporary directories
 */
rimraf.sync(t([]));
mkdirp.sync(t(["_omittedDir"]));
mkdirp.sync(t(["depwatch"]));
mkdirp.sync(t(["inputs", "level-1-1"]));
mkdirp.sync(t(["inputs", "level-1-2"]));
mkdirp.sync(t(["outputs", "level-1-1"]));
mkdirp.sync(t(["outputs", "level-1-2"]));

/*
 * CLI utilities
 */
// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("miscellanea", function (this: any) {
	timing(this);
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--version", (done: any) => {
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["-V"], (err: any, stdout: any) => {
			if (err) done(err);
			assert.equal(
				stdout.trim(),
				// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
				`pug version: ${require("pug/package.json").version}\npug-cli version: ${require("../package.json").version}`
			);
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--version"], (err: any, stdout: any) => {
				if (err) done(err);
				assert.equal(
					stdout.trim(),
					// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
					`pug version: ${require("pug/package.json").version}\npug-cli version: ${require("../package.json").version}`
				);
				done();
			});
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--help", (done: any) => {
		// only check that it doesn't crash
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["-h"], (err: any, stdout: any) => {
			if (err) done(err);
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--help"], (err: any, stdout: any) => {
				if (err) done(err);
				done();
			});
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("Omits files starting with an underscore", (done: any) => {
		w("_omitted.pug", ".foo bar");
		w("_omitted.html", "<p>output not written</p>");

		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["_omitted.pug"], (err: any) => {
			if (err) return done(err);
			const html = r("_omitted.html");
			assert(html === "<p>output not written</p>");
			done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("Omits directories starting with an underscore", (done: any) => {
		w("_omittedDir/file.pug", ".foo bar");
		w("_omittedDir/file.html", "<p>output not written</p>");

		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "_omittedDir/file.pug"], (err: any, stdout: any) => {
			if (err) return done(err);
			const html = r("_omittedDir/file.html");
			assert.equal(html, "<p>output not written</p>");
			done();
		});
	});
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("HTML output", function (this: any) {
	timing(this);
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("works", (done: any) => {
		w("input.pug", ".foo bar");
		w("input.html", "<p>output not written</p>");

		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "input.pug"], (err: any) => {
			if (err) return done(err);
			const html = r("input.html");
			assert(html === '<div class="foo">bar</div>');
			done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--extension", (done: any) => {
		w("input.pug", ".foo bar");
		w("input.special-html", "<p>output not written</p>");

		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "-E", "special-html", "input.pug"], (err: any) => {
			if (err) return done(err);
			const html = r("input.special-html");
			assert(html === '<div class="foo">bar</div>');
			done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--basedir", (done: any) => {
		w("input.pug", "extends /dependency1.pug");
		w("input.html", "<p>output not written</p>");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "-b", j([__dirname, "dependencies"]), "input.pug"], (err: any, stdout: any) => {
			if (err) return done(err);
			const html = r("input.html");
			assert.equal(html, "<html><body></body></html>");
			done();
		});
	});
	// @ts-expect-error TS(2304): Cannot find name 'context'.
	context("--obj", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("JavaScript syntax works", (done: any) => {
			w("input.pug", ".foo= loc");
			w("input.html", "<p>output not written</p>");
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--obj", "{'loc':'str'}", "input.pug"], (err: any) => {
				if (err) return done(err);
				const html = r("input.html");
				assert(html === '<div class="foo">str</div>');
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("JavaScript syntax does not accept UTF newlines", (done: any) => {
			w("input.pug", ".foo= loc");
			w("input.html", "<p>output not written</p>");
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--obj", "{'loc':'st\u2028r'}", "input.pug"], (err: any) => {
				if (!err) return done(new Error("expecting error"));
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("JSON syntax accept UTF newlines", (done: any) => {
			w("input.pug", ".foo= loc");
			w("input.html", "<p>output not written</p>");
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--obj", '{"loc":"st\u2028r"}', "input.pug"], (err: any) => {
				if (err) return done(err);
				const html = r("input.html");
				assert.equal(html, '<div class="foo">st\u2028r</div>');
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("JSON file", (done: any) => {
			w("obj.json", '{"loc":"str"}');
			w("input.pug", ".foo= loc");
			w("input.html", "<p>output not written</p>");
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--obj", "obj.json", "input.pug"], (err: any) => {
				if (err) return done(err);
				const html = r("input.html");
				assert(html === '<div class="foo">str</div>');
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("JavaScript module", (done: any) => {
			w("obj.js", 'module.exports = {loc: "str"};');
			w("input.pug", ".foo= loc");
			w("input.html", "<p>output not written</p>");
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--obj", "obj.js", "input.pug"], (err: any) => {
				if (err) return done(err);
				const html = r("input.html");
				assert(html === '<div class="foo">str</div>');
				done();
			});
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("stdio", (done: any) => {
		w("input.pug", ".foo bar");
		// @ts-expect-error TS(6133): 'stderr' is declared but its value is never read.
		run(["--no-debug"], rs("input.pug"), (err: any, stdout: any, stderr: any) => {
			if (err) return done(err);
			assert(stdout === '<div class="foo">bar</div>');
			done();
		});
	});
	// @ts-expect-error TS(2304): Cannot find name 'context'.
	context("--out", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("works", (done: any) => {
			w("input.pug", ".foo bar");
			w("input.html", "<p>output not written</p>");
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--out", "outputs", "input.pug"], (err: any) => {
				if (err) return done(err);
				const html = r(["outputs", "input.html"]);
				assert(html === '<div class="foo">bar</div>');
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("works when input is a directory", (done: any) => {
			w(["inputs", "input.pug"], ".foo bar 1");
			w(["inputs", "level-1-1", "input.pug"], ".foo bar 1-1");
			w(["inputs", "level-1-2", "input.pug"], ".foo bar 1-2");
			w(["outputs", "input.html"], "BIG FAT HEN 1");
			w(["outputs", "level-1-1", "input.html"], "BIG FAT HEN 1-1");
			w(["outputs", "level-1-2", "input.html"], "BIG FAT HEN 1-2");

			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--hierarchy", "--out", "outputs", "inputs"], (err: any) => {
				if (err) return done(err);
				var html = r(["outputs", "input.html"]);
				assert(html === '<div class="foo">bar 1</div>');
				var html = r(["outputs", "level-1-1", "input.html"]);
				assert(html === '<div class="foo">bar 1-1</div>');
				var html = r(["outputs", "level-1-2", "input.html"]);
				assert(html === '<div class="foo">bar 1-2</div>');
				done();
			});
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--silent", (done: any) => {
		w("input.pug", ".foo bar");
		w("input.html", "<p>output not written</p>");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "-s", "input.pug"], (err: any, stdout: any) => {
			if (err) return done(err);
			const html = r("input.html");
			assert.equal(html, '<div class="foo">bar</div>');
			assert.equal(stdout, "");

			w("input.html", "<p>output not written</p>");
			// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
			run(["--no-debug", "--silent", "input.pug"], (err: any, stdout: any) => {
				if (err) return done(err);
				const html = r("input.html");
				assert.equal(html, '<div class="foo">bar</div>');
				assert.equal(stdout, "");
				done();
			});
		});
	});
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("client JavaScript output", function (this: any) {
	timing(this);
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("works", (done: any) => {
		w("input.pug", ".foo bar");
		w("input.js", 'throw new Error("output not written");');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "--client", "input.pug"], (err: any) => {
			if (err) return done(err);
			const template = Function("", `${r("input.js")};return template;`)();
			assert(template() === '<div class="foo">bar</div>');
			done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--name", (done: any) => {
		w("input.pug", ".foo bar");
		w("input.js", 'throw new Error("output not written");');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "--client", "--name", "myTemplate", "input.pug"], (err: any) => {
			if (err) return done(err);
			const template = Function("", `${r("input.js")};return myTemplate;`)();
			assert(template() === '<div class="foo">bar</div>');
			done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--name --extension", (done: any) => {
		w("input.pug", ".foo bar");
		w("input.special-js", 'throw new Error("output not written");');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "--client", "-E", "special-js", "input.pug"], (err: any) => {
			if (err) return done(err);
			const template = Function("", `${r("input.special-js")};return template;`)();
			assert(template() === '<div class="foo">bar</div>');
			done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("stdio", (done: any) => {
		w("input.pug", ".foo bar");
		w("input.js", 'throw new Error("output not written");');
		run(["--no-debug", "--client"], rs("input.pug"), (err: any, stdout: any) => {
			if (err) return done(err);
			const template = Function("", `${stdout};return template;`)();
			assert(template() === '<div class="foo">bar</div>');
			done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--name-after-file", (done: any) => {
		w("input-file.pug", ".foo bar");
		w("input-file.js", 'throw new Error("output not written");');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(["--no-debug", "--client", "--name-after-file", "input-file.pug"], (err: any, stdout: any, stderr: any) => {
			if (err) return done(err);
			const template = Function("", `${r("input-file.js")};return inputFileTemplate;`)();
			assert(template() === '<div class="foo">bar</div>');
			return done();
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("--name-after-file ·InPuTwIthWEiRdNaMME.pug", (done: any) => {
		w("·InPuTwIthWEiRdNaMME.pug", ".foo bar");
		w("·InPuTwIthWEiRdNaMME.js", 'throw new Error("output not written");');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		run(
			["--no-debug", "--client", "--name-after-file", "·InPuTwIthWEiRdNaMME.pug"],
			// @ts-expect-error TS(6133): 'stdout' is declared but its value is never read.
			(err: any, stdout: any, stderr: any) => {
				if (err) return done(err);
				const template = Function("", `${r("·InPuTwIthWEiRdNaMME.js")};return InputwithweirdnammeTemplate;`)();
				assert(template() === '<div class="foo">bar</div>');
				return done();
			}
		);
	});
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("--watch", () => {
	let watchProc: any;
	let stdout = "";

	function cleanup() {
		stdout = "";
		if (!watchProc) return;

		watchProc.stderr.removeAllListeners("data");
		watchProc.stdout.removeAllListeners("data");
		watchProc.removeAllListeners("error");
		watchProc.removeAllListeners("close");
	}

	// @ts-expect-error TS(2304): Cannot find name 'after'.
	after(() => {
		cleanup();
		watchProc.kill("SIGINT");
		watchProc = null;
	});

	// @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
	beforeEach(cleanup);

	// @ts-expect-error TS(2304): Cannot find name 'afterEach'.
	afterEach((done: any) => {
		// pug --watch can only detect changes that are at least 1 second apart
		setTimeout(done, 1000);
	});

	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 1: initial compilation", function (this: any, done: any) {
		timing(this);

		w("input-file.pug", ".foo bar");
		w("input-file.js", 'throw new Error("output not written (pass 1)");');
		const cmd = getRunner();
		cmd[1].push("--no-debug", "--client", "--name-after-file", "--watch", "input-file.pug");
		watchProc = cp.spawn(cmd[0], cmd[1], {
			cwd: t([]),
		});

		watchProc.stdout.setEncoding("utf8");
		watchProc.stderr.setEncoding("utf8");
		watchProc.on("error", done);
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if (stdout.includes("rendered")) {
				cleanup();

				const template = Function("", `${r("input-file.js")};return inputFileTemplate;`)();
				assert(template() === '<div class="foo">bar</div>');

				return done();
			}
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 2: change the file", (done: any) => {
		w("input-file.js", 'throw new Error("output not written (pass 2)");');

		watchProc.on("error", done);
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if (stdout.includes("rendered")) {
				cleanup();

				const template = Function("", `${r("input-file.js")};return inputFileTemplate;`)();
				assert(template() === '<div class="foo">baz</div>');

				return done();
			}
		});

		w("input-file.pug", ".foo baz");
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 3: remove the file then add it back", (done: any) => {
		w("input-file.js", 'throw new Error("output not written (pass 3)");');

		watchProc.on("error", done);
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if (stdout.includes("rendered")) {
				cleanup();

				const template = Function("", `${r("input-file.js")};return inputFileTemplate;`)();
				assert(template() === '<div class="foo">bat</div>');

				return done();
			}
		});

		u("input-file.pug");
		setTimeout(() => {
			w("input-file.pug", ".foo bat");
		}, 250);
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 4: intentional errors in the pug file", (done: any) => {
		let stderr = "";
		let errored = false;

		watchProc.on("error", done);
		watchProc.on("close", () => {
			errored = true;
			return done(new Error("Pug should not terminate in watch mode"));
		});
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if (stdout.includes("rendered")) {
				stdout = "";
				return done(new Error("Pug compiles an erroneous file w/o error"));
			}
		});
		watchProc.stderr.on("data", (buf: any) => {
			stderr += buf;
			if (!stderr.includes("Invalid indentation")) return;
			stderr = "";
			const template = Function("", `${r("input-file.js")};return inputFileTemplate;`)();
			assert(template() === '<div class="foo">bat</div>');

			watchProc.stderr.removeAllListeners("data");
			watchProc.stdout.removeAllListeners("data");
			watchProc.removeAllListeners("error");
			watchProc.removeAllListeners("exit");
			// The stderr event will always fire sooner than the close event.
			// Wait for it.
			setTimeout(() => {
				if (!errored) done();
			}, 100);
		});

		w("input-file.pug", ["div", "  div", "\tarticle"].join("\n"));
	});
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("--watch with dependencies", () => {
	let watchProc: any;
	let stdout = "";

	// @ts-expect-error TS(2304): Cannot find name 'before'.
	before(() => {
		function copy(file: any) {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			w(["depwatch", file], fs.readFileSync(j([__dirname, "dependencies", file])));
		}
		copy("include2.pug");
		copy("dependency2.pug");
		copy("dependency3.pug");
	});

	function cleanup() {
		stdout = "";

		if (!watchProc) return;

		watchProc.stderr.removeAllListeners("data");
		watchProc.stdout.removeAllListeners("data");
		watchProc.removeAllListeners("error");
		watchProc.removeAllListeners("close");
	}

	// @ts-expect-error TS(2304): Cannot find name 'after'.
	after(() => {
		cleanup();
		watchProc.kill("SIGINT");
		watchProc = null;
	});

	// @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
	beforeEach(cleanup);

	// @ts-expect-error TS(2304): Cannot find name 'afterEach'.
	afterEach((done: any) => {
		// pug --watch can only detect changes that are at least 1 second apart
		setTimeout(done, 1000);
	});

	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 1: initial compilation", function (this: any, done: any) {
		timing(this);

		w(["depwatch", "include2.html"], "output not written (pass 1)");
		w(["depwatch", "dependency2.html"], "output not written (pass 1)");
		const cmd = getRunner();
		cmd[1].push("--watch", "include2.pug", "dependency2.pug");
		watchProc = cp.spawn(cmd[0], cmd[1], {
			cwd: t("depwatch"),
		});

		watchProc.stdout.setEncoding("utf8");
		watchProc.stderr.setEncoding("utf8");
		watchProc.on("error", done);
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if ((stdout.match(/rendered/g) || []).length === 2) {
				cleanup();

				let output = r(["depwatch", "include2.html"]);
				assert.equal(output.trim(), "<strong>dependency3</strong>");
				output = r(["depwatch", "dependency2.html"]);
				assert.equal(output.trim(), "<strong>dependency3</strong>");

				return done();
			}
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 2: change a dependency", function (this: any, done: any) {
		timing(this);

		w(["depwatch", "include2.html"], "output not written (pass 2)");
		w(["depwatch", "dependency2.html"], "output not written (pass 2)");

		watchProc.on("error", done);
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if ((stdout.match(/rendered/g) || []).length === 2) {
				cleanup();

				let output = r(["depwatch", "include2.html"]);
				assert.equal(output.trim(), "<strong>dependency3</strong><p>Hey</p>");
				output = r(["depwatch", "dependency2.html"]);
				assert.equal(output.trim(), "<strong>dependency3</strong><p>Hey</p>");

				return done();
			}
		});

		a(["depwatch", "dependency2.pug"], "\np Hey\n");
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 3: change a deeper dependency", function (this: any, done: any) {
		timing(this);

		w(["depwatch", "include2.html"], "output not written (pass 3)");
		w(["depwatch", "dependency2.html"], "output not written (pass 3)");

		watchProc.on("error", done);
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if ((stdout.match(/rendered/g) || []).length === 2) {
				cleanup();

				let output = r(["depwatch", "include2.html"]);
				assert.equal(output.trim(), "<strong>dependency3</strong><p>Foo</p><p>Hey</p>");
				output = r(["depwatch", "dependency2.html"]);
				assert.equal(output.trim(), "<strong>dependency3</strong><p>Foo</p><p>Hey</p>");

				return done();
			}
		});

		a(["depwatch", "dependency3.pug"], "\np Foo\n");
	});
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("pass 4: change main file", function (this: any, done: any) {
		timing(this);

		w(["depwatch", "include2.html"], "output not written (pass 4)");
		w(["depwatch", "dependency2.html"], "output not written (pass 4)");

		watchProc.on("error", done);
		watchProc.stdout.on("data", (buf: any) => {
			stdout += buf;
			if ((stdout.match(/rendered/g) || []).length === 1) {
				cleanup();

				let output = r(["depwatch", "include2.html"]);
				assert.equal(output.trim(), "<strong>dependency3</strong><p>Foo</p><p>Hey</p><p>Baz</p>");
				output = r(["depwatch", "dependency2.html"]);
				assert.equal(output.trim(), "output not written (pass 4)");

				return done();
			}
		});

		a(["depwatch", "include2.pug"], "\np Baz\n");
	});
});
