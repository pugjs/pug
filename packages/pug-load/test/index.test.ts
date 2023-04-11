// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'walk'.
const walk = require("pug-walk");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'lex'.
const lex = require("pug-lexer");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
const parse = require("pug-parser");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const load = require("../");

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("pug-load", () => {
	// @ts-expect-error TS(2304): Cannot find name '__dirname'.
	const filename = `${__dirname}/foo.pug`;
	let ast = load.file(filename, {
		lex,
		parse,
	});

	ast = walk(
		ast,
		(node: any) => {
			// @ts-expect-error TS(2339): Property 'basename' does not exist on type 'string... Remove this comment to see the full error message
			if (node.filename) node.filename = `<dirname>/${path.basename(node.filename)}`;
			// @ts-expect-error TS(2339): Property 'basename' does not exist on type 'string... Remove this comment to see the full error message
			if (node.fullPath) node.fullPath = `<dirname>/${path.basename(node.fullPath)}`;
		},
		{ includeDependencies: true }
	);

	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(ast).toMatchSnapshot();
});
