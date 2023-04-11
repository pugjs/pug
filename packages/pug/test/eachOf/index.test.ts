// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../../");

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Inproper Usage", () => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("Only left-side bracket", () => {
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(() => pug.compileFile(`${__dirname}/error/left-side.pug`)).toThrow(
			"The value variable for each must either be a valid identifier (e.g. `item`) or a pair of identifiers in square brackets (e.g. `[key, value]`)."
		);
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("Only right-side bracket", () => {
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(() => pug.compileFile(`${__dirname}/error/right-side.pug`)).toThrow(
			"The value variable for each must either be a valid identifier (e.g. `item`) or a pair of identifiers in square brackets (e.g. `[key, value]`)."
		);
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("Only one value inside brackets", () => {
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(() => pug.compileFile(`${__dirname}/error/one-val.pug`)).toThrow(
			"The value variable for each must either be a valid identifier (e.g. `item`) or a pair of identifiers in square brackets (e.g. `[key, value]`)."
		);
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("No brackets", () => {
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(() => pug.compileFile(`${__dirname}/error/no-brackets.pug`)).toThrow(
			"The value variable for each must either be a valid identifier (e.g. `item`) or a pair of identifiers in square brackets (e.g. `[key, value]`)."
		);
	});
});
// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Proper Usage", () => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("Brackets", () => {
		// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
		const html = pug.renderFile(`${__dirname}/passing/brackets.pug`, {
			users: new Map([
				["a", "b"],
				["foo", "bar"],
			]),
		});
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(html).toMatchSnapshot();
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("No Brackets", () => {
		// @ts-expect-error TS(2304): Cannot find name '__dirname'.
		const html = pug.renderFile(`${__dirname}/passing/no-brackets.pug`, {
			users: new Map([
				["a", "b"],
				["foo", "bar"],
			]),
		});
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(html).toMatchSnapshot();
	});
});
