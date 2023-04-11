// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'lex'.
const lex = require("pug-lexer");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
const parse = require("pug-parser");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handleFilt... Remove this comment to see the full error message
const handleFilters = require("../").handleFilters;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'customFilt... Remove this comment to see the full error message
const customFilters = {};
// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("per filter options are applied, even to nested filters", () => {
	const source = `
script
  :cdata:uglify-js
    function myFunc(foo) {
      return foo;
    }
  `;

	// @ts-expect-error TS(2304): Cannot find name '__filename'.
	const ast = parse(lex(source, { filename: __filename }), {
		// @ts-expect-error TS(2304): Cannot find name '__filename'.
		filename: __filename,
		src: source,
	});

	const options = {
		"uglify-js": { output: { beautify: true } },
	};

	// @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
	const output = handleFilters(ast, customFilters, options);
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(output).toMatchSnapshot();

	// TODO: render with `options.filterOptions['uglify-js']`
});
