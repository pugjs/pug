// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("#3295 - lexer plugins should be used in tag interpolation", () => {
	const lex = {
		advance(lexer: any) {
			if ("~" === lexer.input.charAt(0)) {
				lexer.tokens.push(lexer.tok("text", "twiddle-dee-dee"));
				lexer.consume(1);
				lexer.incrementColumn(1);
				return true;
			}
		},
	};
	const input = "p Look at #[~]";
	const expected = "<p>Look at twiddle-dee-dee</p>";
	const output = pug.render(input, { plugins: [{ lex }] });
	// @ts-expect-error TS(2552): Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
	expect(output).toEqual(expected);
});
