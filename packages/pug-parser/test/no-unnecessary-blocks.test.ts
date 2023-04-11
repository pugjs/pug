// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'lex'.
const lex = require("pug-lexer");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
const parse = require("../");

const input = `
div
  | Hello
  | World
`;

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("no uncessessary blocks should be added", () => {
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(parse(lex(input))).toMatchSnapshot();
});
