// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const lineJSON = require("line-json");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const strip = require("../");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dir'.
const dir = `${__dirname}/cases/`;
fs.readdirSync(dir).forEach((testCase: any) => {
	if (testCase.endsWith(".input.json")) {
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(testCase, () => {
			// @ts-expect-error TS(6133): 'stem' is declared but its value is never read.
			const stem = testCase.replace(/\.input\.json$/, ".");

			// @ts-expect-error TS(6133): 'name' is declared but its value is never read.
			function test(name: any, options: any) {
				let input = fs.readFileSync(dir + testCase, "utf8");
				input = lineJSON.parse(input);

				const result = strip(input, options);
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect(result).toMatchSnapshot();
			}

			// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
			test("unbuffered");
			test("buffered", { stripBuffered: true, stripUnbuffered: false });
			test("both", { stripBuffered: true });
		});
	}
});

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'edir'.
const edir = `${__dirname}/errors/`;
fs.readdirSync(edir).forEach((testCase: any) => {
	if (testCase.endsWith(".input.json")) {
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(testCase, () => {
			// @ts-expect-error TS(6133): 'stem' is declared but its value is never read.
			const stem = testCase.replace(/\.input\.json$/, ".");

			let input = fs.readFileSync(edir + testCase, "utf8");
			input = lineJSON.parse(input);

			try {
				strip(input);
				throw new Error(`Expected ${testCase} to throw an exception.`);
			} catch (ex) {
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				if (!ex || !ex.code || ex.code.indexOf("PUG:") !== 0) throw ex;
				// @ts-expect-error TS(2304): Cannot find name 'expect'.
				expect({
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					msg: ex.msg,
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					code: ex.code,
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					line: ex.line,
				}).toMatchSnapshot();
			}
		});
	}
});
