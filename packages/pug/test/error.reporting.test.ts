/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");

// Shortcut

function getError(str: any, options: any) {
	try {
		pug.render(str, options);
	} catch (ex) {
		return ex;
	}
	throw new Error("Input was supposed to result in an error.");
}
function getFileError(name: any, options: any) {
	try {
		pug.renderFile(name, options);
	} catch (ex) {
		return ex;
	}
	throw new Error("Input was supposed to result in an error.");
}

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("error reporting", () => {
	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe("compile time errors", () => {
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with no filename", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown", () => {
				// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
				const err = getError("foo(");
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/Pug:1/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo\(/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a filename", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				const err = getError("foo(", { filename: "test.pug" });
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/test\.pug:1/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo\(/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a layout without block declaration (syntax)", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/compile.with.layout.syntax.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/[\\\/]layout.syntax.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo\(/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a layout without block declaration (locals)", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/compile.with.layout.locals.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/[\\\/]layout.locals.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/is not a function/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a include (syntax)", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/compile.with.include.syntax.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/[\\\/]include.syntax.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo\(/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a include (locals)", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/compile.with.include.locals.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/[\\\/]include.locals.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo\(/);
			});

			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("handles compileDebug option properly", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/compile.with.include.locals.error.pug`, {
					compileDebug: true,
				});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/[\\\/]include.locals.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo is not a function/);
			});
		});

		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a layout (without block) with an include (syntax)", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/compile.with.layout.with.include.syntax.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/[\\\/]include.syntax.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo\(/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a layout (without block) with an include (locals)", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/compile.with.layout.with.include.locals.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/[\\\/]include.locals.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/foo\(/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("block that is never actually used", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/invalid-block-in-extends.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/invalid-block-in-extends.pug:6/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/content/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("Unexpected character", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes details of where the error was thrown", () => {
				const err = getError("ul?", {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/unexpected text \"\?\"/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("Include filtered", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes details of where the error was thrown", () => {
				var err = getError("include:verbatim()!", {});
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				assert(err.message.indexOf('unexpected text "!"') !== -1);
				var err = getError("include:verbatim ", {});
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				assert(err.message.indexOf("missing path for include") !== -1);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("mixin block followed by a lot of blank lines", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("reports the correct line number", () => {
				// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
				const err = getError("mixin test\n    block\n\ndiv()Test");
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				const line = /Pug\:(\d+)/.exec(err.message);
				assert(line, "Line number must be included in error message");
				// @ts-expect-error TS(2531): Object is possibly 'null'.
				assert(line[1] === "4", `The error should be reported on line 4, not line ${line[1]}`);
			});
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe("runtime errors", () => {
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with no filename and `compileDebug` left undefined", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("just reports the line number", () => {
				const sentinel = new Error("sentinel");
				const err = getError("-foo()", {
					foo() {
						throw sentinel;
					},
				});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/on line 1/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with no filename and `compileDebug` set to `true`", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown", () => {
				const sentinel = new Error("sentinel");
				const err = getError("-foo()", {
					foo() {
						throw sentinel;
					},
					compileDebug: true,
				});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/Pug:1/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/-foo\(\)/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a filename that does not correspond to a real file and `compileDebug` left undefined", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("just reports the line number", () => {
				const sentinel = new Error("sentinel");
				const err = getError("-foo()", {
					foo() {
						throw sentinel;
					},
					filename: "fake.pug",
				});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/on line 1/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("with a filename that corresponds to a real file and `compileDebug` left undefined", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				const sentinel = new Error("sentinel");
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const path = `${__dirname}/fixtures/runtime.error.pug`;
				const err = getError(fs.readFileSync(path, "utf8"), {
					foo() {
						throw sentinel;
					},
					filename: path,
				});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/fixtures[\\\/]runtime\.error\.pug:1/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/-foo\(\)/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("in a mixin", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/runtime.with.mixin.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/mixin.error.pug:2/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/Cannot read property 'length' of null/);
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe("in a layout", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("includes detail of where the error was thrown including the filename", () => {
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				const err = getFileError(`${__dirname}/fixtures/runtime.layout.error.pug`, {});
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/layout.with.runtime.error.pug:3/);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(err.message).toMatch(/Cannot read property 'length' of undefined/);
			});
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe("deprecated features", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("warns about element-with-multiple-attributes", () => {
			const consoleWarn = console.warn;
			let log = "";
			console.warn = function (str) {
				log += str;
			};
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const res = pug.renderFile(`${__dirname}/fixtures/element-with-multiple-attributes.pug`);
			console.warn = consoleWarn;
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(log).toMatch(/element-with-multiple-attributes.pug, line 1:/);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(log).toMatch(/You should not have pug tags with multiple attributes/);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(res).toBe('<div attr="val" foo="bar"></div>');
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe("if you throw something that isn't an error", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("just rethrows without modification", () => {
			// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
			const err = getError('- throw "foo"');
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err).toBe("foo");
		});
	});
	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe("import without a filename for a basedir", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("throws an error", () => {
			// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
			var err = getError("include foo.pug");
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.message).toMatch(/the "filename" option is required to use/);
			// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
			var err = getError("include /foo.pug");
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.message).toMatch(/the "basedir" option is required to use/);
		});
	});
});
