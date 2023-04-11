// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../../");

// regression test for #2404

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("extends not top level should throw an error", () => {
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(() => pug.compileFile(`${__dirname}/index.pug`)).toThrow(
		'Declaration of template inheritance ("extends") should be the first thing in the file. There can only be one extends statement per file.'
	);
});

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("duplicate extends should throw an error", () => {
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(() => pug.compileFile(`${__dirname}/duplicate.pug`)).toThrow(
		'Declaration of template inheritance ("extends") should be the first thing in the file. There can only be one extends statement per file.'
	);
});
