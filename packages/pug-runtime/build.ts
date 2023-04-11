// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dependenci... Remove this comment to see the full error message
const dependencies = require("./lib/dependencies.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'internals'... Remove this comment to see the full error message
const internals = require("./lib/internals.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sources'.
const sources = require("./lib/sources.js");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = build;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'build'.
function build(functions: any) {
	// @ts-expect-error TS(7034): Variable 'fns' implicitly has type 'any[]' in some... Remove this comment to see the full error message
	const fns = [];
	functions = functions.filter((fn: any) => {
		return !internals[fn];
	});
	for (let i = 0; i < functions.length; i++) {
		// @ts-expect-error TS(7005): Variable 'fns' implicitly has an 'any[]' type.
		if (!fns.includes(functions[i])) {
			fns.push(functions[i]);
			functions.push.apply(functions, dependencies[functions[i]]);
		}
	}
	return fns
		.sort()
		.map((name) => {
			return sources[name];
		})
		.join("\n");
}
