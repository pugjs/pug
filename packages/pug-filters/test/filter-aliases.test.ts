// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'lex'.
const lex = require("pug-lexer");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
const parse = require("pug-parser");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handleFilt... Remove this comment to see the full error message
const handleFilters = require("../").handleFilters;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'customFilt... Remove this comment to see the full error message
const customFilters = {};
// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("filters can be aliased", () => {
	const source = `
script
  :cdata:minify
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

	const options = {};
	const aliases = {
		minify: "uglify-js",
	};

	const output = handleFilters(ast, customFilters, options, aliases);
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(output).toMatchSnapshot();
});

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("we do not support chains of aliases", () => {
	const source = `
script
  :cdata:minify-js
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

	const options = {};
	const aliases = {
		"minify-js": "minify",
		minify: "uglify-js",
	};

	try {
		// @ts-expect-error TS(6133): 'output' is declared but its value is never read.
		const output = handleFilters(ast, customFilters, options, aliases);
	} catch (ex) {
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect({
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			code: ex.code,
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			message: ex.message,
		}).toMatchSnapshot();
		return;
	}
	throw new Error("Expected an exception");
});

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("options are applied before aliases", () => {
	const source = `
script
  :cdata:minify
    function myFunc(foo) {
      return foo;
    }
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
		minify: { output: { beautify: true } },
	};
	const aliases = {
		minify: "uglify-js",
	};

	const output = handleFilters(ast, customFilters, options, aliases);
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(output).toMatchSnapshot();
});
