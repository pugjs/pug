// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const utils = require("util");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const attrs = require("../");

let options: $TSFixMe;

function test(input: any, expected: any, locals: any) {
	const opts = options;
	locals = locals || {};
	// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
	locals.pug = locals.pug || require("pug-runtime");
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it(`${utils.inspect(input).replace(/\n/g, "")} => ${utils.inspect(expected)}`, () => {
		const src = attrs(input, opts);
		const localKeys = Object.keys(locals).sort();
		const output = Function(localKeys.join(", "), `return (${src});`).apply(
			null,
			localKeys.map((key) => {
				return locals[key];
			})
		);
		if (opts.format === "html") {
			// @ts-expect-error TS(2552): Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
			expect(output).toBe(expected);
		} else {
			// @ts-expect-error TS(2552): Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
			expect(output).toEqual(expected);
		}
	});
}
function withOptions(opts: any, fn: any) {
	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(`options: ${utils.inspect(opts)}`, () => {
		options = opts;
		fn();
	});
}

withOptions(
	{
		terse: true,
		format: "html",
		runtime(name: any) {
			return `pug.${name}`;
		},
	},
	() => {
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([], "");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "false", mustEscape: true }], "");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "true", mustEscape: true }], " foo");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: false, mustEscape: true }], "");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: true, mustEscape: true }], " foo");
		test([{ name: "foo", val: "foo", mustEscape: true }], "", { foo: false });
		test([{ name: "foo", val: "foo", mustEscape: true }], " foo", { foo: true });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: '"foo"', mustEscape: true }], ' foo="foo"');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "foo", val: '"foo"', mustEscape: true },
				{ name: "bar", val: '"bar"', mustEscape: true },
			],
			' foo="foo" bar="bar"'
		);
		test([{ name: "foo", val: "foo", mustEscape: true }], ' foo="fooo"', {
			foo: "fooo",
		});
		test(
			[
				{ name: "foo", val: "foo", mustEscape: true },
				{ name: "bar", val: "bar", mustEscape: true },
			],
			' foo="fooo" bar="baro"',
			{ foo: "fooo", bar: "baro" }
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "style", val: '{color: "red"}', mustEscape: true }], ' style="color:red;"');
		test([{ name: "style", val: "{color: color}", mustEscape: true }], ' style="color:red;"', { color: "red" });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "class", val: '"foo"', mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			' class="foo bar baz"'
		);
		test(
			[
				{ name: "class", val: "{foo: foo}", mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			' class="foo bar baz"',
			{ foo: true }
		);
		test(
			[
				{ name: "class", val: "{foo: foo}", mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			' class="bar baz"',
			{ foo: false }
		);
		test(
			[
				{ name: "class", val: "foo", mustEscape: true },
				{ name: "class", val: '"<str>"', mustEscape: true },
			],
			' class="&lt;foo&gt; &lt;str&gt;"',
			{ foo: "<foo>" }
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "foo", val: '"foo"', mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			' class="bar baz" foo="foo"'
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
				{ name: "foo", val: '"foo"', mustEscape: true },
			],
			' class="bar baz" foo="foo"'
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: '"<foo>"', mustEscape: false }], ' foo="<foo>"');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: '"<foo>"', mustEscape: true }], ' foo="&lt;foo&gt;"');
		test([{ name: "foo", val: "foo", mustEscape: false }], ' foo="<foo>"', {
			foo: "<foo>",
		});
		test([{ name: "foo", val: "foo", mustEscape: true }], ' foo="&lt;foo&gt;"', {
			foo: "<foo>",
		});
	}
);
withOptions(
	{
		terse: false,
		format: "html",
		runtime(name: any) {
			return `pug.${name}`;
		},
	},
	() => {
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "false", mustEscape: true }], "");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "true", mustEscape: true }], ' foo="foo"');
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: false, mustEscape: true }], "");
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: true, mustEscape: true }], ' foo="foo"');
		test([{ name: "foo", val: "foo", mustEscape: true }], "", { foo: false });
		test([{ name: "foo", val: "foo", mustEscape: true }], ' foo="foo"', {
			foo: true,
		});
	}
);

withOptions(
	{
		terse: true,
		format: "object",
		runtime(name: any) {
			return `pug.${name}`;
		},
	},
	() => {
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([], {});
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "false", mustEscape: true }], { foo: false });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "true", mustEscape: true }], { foo: true });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: false, mustEscape: true }], { foo: false });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: true, mustEscape: true }], { foo: true });
		test([{ name: "foo", val: "foo", mustEscape: true }], { foo: false }, { foo: false });
		test([{ name: "foo", val: "foo", mustEscape: true }], { foo: true }, { foo: true });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: '"foo"', mustEscape: true }], { foo: "foo" });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "foo", val: '"foo"', mustEscape: true },
				{ name: "bar", val: '"bar"', mustEscape: true },
			],
			{ foo: "foo", bar: "bar" }
		);
		test([{ name: "foo", val: "foo", mustEscape: true }], { foo: "fooo" }, { foo: "fooo" });
		test(
			[
				{ name: "foo", val: "foo", mustEscape: true },
				{ name: "bar", val: "bar", mustEscape: true },
			],
			{ foo: "fooo", bar: "baro" },
			{ foo: "fooo", bar: "baro" }
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "style", val: '{color: "red"}', mustEscape: true }], {
			style: "color:red;",
		});
		test([{ name: "style", val: "{color: color}", mustEscape: true }], { style: "color:red;" }, { color: "red" });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "class", val: '"foo"', mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			{ class: "foo bar baz" }
		);
		test(
			[
				{ name: "class", val: "{foo: foo}", mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			{ class: "foo bar baz" },
			{ foo: true }
		);
		test(
			[
				{ name: "class", val: "{foo: foo}", mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			{ class: "bar baz" },
			{ foo: false }
		);
		test(
			[
				{ name: "class", val: "foo", mustEscape: true },
				{ name: "class", val: '"<str>"', mustEscape: true },
			],
			{ class: "&lt;foo&gt; &lt;str&gt;" },
			{ foo: "<foo>" }
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "foo", val: '"foo"', mustEscape: true },
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
			],
			{ class: "bar baz", foo: "foo" }
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test(
			[
				{ name: "class", val: '["bar", "baz"]', mustEscape: true },
				{ name: "foo", val: '"foo"', mustEscape: true },
			],
			{ class: "bar baz", foo: "foo" }
		);
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: '"<foo>"', mustEscape: false }], { foo: "<foo>" });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: '"<foo>"', mustEscape: true }], {
			foo: "&lt;foo&gt;",
		});
		test([{ name: "foo", val: "foo", mustEscape: false }], { foo: "<foo>" }, { foo: "<foo>" });
		test([{ name: "foo", val: "foo", mustEscape: true }], { foo: "&lt;foo&gt;" }, { foo: "<foo>" });
	}
);
withOptions(
	{
		terse: false,
		format: "object",
		runtime(name: any) {
			return `pug.${name}`;
		},
	},
	() => {
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "false", mustEscape: true }], { foo: false });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: "true", mustEscape: true }], { foo: true });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: false, mustEscape: true }], { foo: false });
		// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
		test([{ name: "foo", val: true, mustEscape: true }], { foo: true });
		test([{ name: "foo", val: "foo", mustEscape: true }], { foo: false }, { foo: false });
		test([{ name: "foo", val: "foo", mustEscape: true }], { foo: true }, { foo: true });
	}
);
