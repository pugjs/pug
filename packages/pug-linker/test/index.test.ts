// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'link'.
const link = require("../");

function testDir(dir: any) {
	fs.readdirSync(dir).forEach((name: any) => {
		if (!name.endsWith(".input.json")) return;
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(name, () => {
			const actual = link(JSON.parse(fs.readFileSync(`${dir}/${name}`, "utf8")));
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(actual).toMatchSnapshot();
		});
	});
}

function testDirError(dir: any) {
	fs.readdirSync(dir).forEach((name: any) => {
		if (!name.endsWith(".input.json")) return;
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(name, () => {
			const input = JSON.parse(fs.readFileSync(`${dir}/${name}`, "utf8"));
			let err;
			try {
				link(input);
			} catch (ex) {
				err = {
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					msg: ex.msg,
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					code: ex.code,
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					line: ex.line,
				};
			}
			if (!err) throw new Error("Expected error");
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err).toMatchSnapshot();
		});
	});
}

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("cases from pug", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	testDir(`${__dirname}/cases`);
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("special cases", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	testDir(`${__dirname}/special-cases`);
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("error handling", () => {
	// @ts-expect-error TS(2304): Cannot find name '__dirname'.
	testDirError(`${__dirname}/errors`);
});
