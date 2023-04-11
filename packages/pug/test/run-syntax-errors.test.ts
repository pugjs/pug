// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'runUtils'.
const runUtils = require("./run-utils");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");

// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
const anti = runUtils.findCases(`${__dirname}/anti-cases`);

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("certain syntax is not allowed and will throw a compile time error", () => {
	anti.forEach((test: any) => {
		const name = test.replace(/[-.]/g, " ");
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it(name, () => {
			// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
			const path = `${__dirname.replace(/\\/g, "/")}/anti-cases/${test}.pug`;
			const str = fs.readFileSync(path, "utf8");
			try {
				// @ts-expect-error TS(6133): 'fn' is declared but its value is never read.
				const fn = pug.compile(str, {
					filename: path,
					pretty: true,
					// @ts-expect-error TS(2304): Cannot find name '__dirname'.
					basedir: `${__dirname}/anti-cases`,
					filters: runUtils.filters,
				});
			} catch (ex) {
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				if (!ex.code) {
					throw ex;
				}
				assert(ex instanceof Error, "Should throw a real Error");
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				assert(ex.code.indexOf("PUG:") === 0, 'It should have a code of "PUG:SOMETHING"');
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				assert(ex.message.replace(/\\/g, "/").indexOf(path) === 0, "it should start with the path");
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				assert(/:\d+$/m.test(ex.message.replace(/\\/g, "/")), "it should include a line number.");
				return;
			}
			throw new Error(`${test} should have thrown an error`);
		});
	});
});
