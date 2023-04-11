// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'mkdirp'.
const mkdirp = require("mkdirp").sync;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'runUtils'.
const runUtils = require("./run-utils");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'cases'.
const cases = runUtils.findCases(`${__dirname}/cases`);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'es2015'.
const es2015 = runUtils.findCases(`${__dirname}/cases-es2015`);

// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
mkdirp(`${__dirname}/output-es2015`);

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("test cases for ECMAScript 2015", () => {
	try {
		eval("``");
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		es2015.forEach(runUtils.testSingle.bind(null, it, "-es2015"));
	} catch (ex) {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		es2015.forEach(runUtils.testSingle.bind(null, it.skip, "-es2015"));
	}
});
