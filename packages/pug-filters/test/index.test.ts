// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handleFilt... Remove this comment to see the full error message
const handleFilters = require("../").handleFilters;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'customFilt... Remove this comment to see the full error message
const customFilters = require("./custom-filters.js");

// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
process.chdir(`${__dirname}/../`);

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'testCases'... Remove this comment to see the full error message
let testCases;

// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
testCases = fs.readdirSync(`${__dirname}/cases`).filter((name: any) => {
	return name.endsWith(".input.json");
});
//
testCases.forEach((filename: any) => {
	function read(path: any) {
		// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
		return fs.readFileSync(`${__dirname}/cases/${path}`, "utf8");
	}

	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test(`cases/${filename}`, () => {
		// @ts-expect-error TS(2554): Expected 4 arguments, but got 2.
		const actualAst = JSON.stringify(handleFilters(JSON.parse(read(filename)), customFilters), null, "  ");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(actualAst).toMatchSnapshot();
	});
});

// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
testCases = fs.readdirSync(`${__dirname}/errors`).filter((name: any) => {
	return name.endsWith(".input.json");
});

testCases.forEach((filename: any) => {
	function read(path: any) {
		// @ts-expect-error TS(2304): Cannot find name '__dirname'.
		return fs.readFileSync(`${__dirname}/errors/${path}`, "utf8");
	}

	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test(`errors/${filename}`, () => {
		let actual;
		try {
			// @ts-expect-error TS(2554): Expected 4 arguments, but got 2.
			handleFilters(JSON.parse(read(filename)), customFilters);
			throw new Error(`Expected ${filename} to throw an exception.`);
		} catch (ex) {
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			if (!ex || !ex.code || ex.code.indexOf("PUG:") !== 0) throw ex;
			actual = {
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				msg: ex.msg,
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				code: ex.code,
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				line: ex.line,
			};
		}
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(actual).toMatchSnapshot();
	});
});
