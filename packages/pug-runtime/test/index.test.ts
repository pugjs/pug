// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'runtime'.
const runtime = require("../");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'build'.
const build = require("../build");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'wrap'.
const wrap = require("../wrap");

function addTest(name: any, fn: any) {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test(name, () => {
		fn(runtime[name]);
		fn(Function("", `${build([name])};return pug_${name};`)());
		fn(wrap(`function t() {return pug.${name};}`, "t")());
	});
}

addTest("attr", (attr: any) => {
	// (key, val, escaped, terse)
	// @ts-expect-error TS(2339): Property 'toJSON' does not exist on type 'String'.
	const stringToJSON = String.prototype.toJSON;

	// @ts-expect-error TS(2339): Property 'toJSON' does not exist on type 'String'.
	String.prototype.toJSON = function () {
		return JSON.stringify(this);
	};

	// Boolean Attributes
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", true, true, true)).toBe(" key");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", true, false, true)).toBe(" key");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", true, true, false)).toBe(' key="key"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", true, false, false)).toBe(' key="key"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", false, true, true)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", false, false, true)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", false, true, false)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", false, false, false)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", null, true, true)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", null, false, true)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", null, true, false)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", null, false, false)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", undefined, true, true)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", undefined, false, true)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", undefined, true, false)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", undefined, false, false)).toBe("");

	// Date Attributes
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", new Date("2014-12-28T16:46:06.962Z"), true, true)).toBe(' key="2014-12-28T16:46:06.962Z"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", new Date("2014-12-28T16:46:06.962Z"), false, true)).toBe(' key="2014-12-28T16:46:06.962Z"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", new Date("2014-12-28T16:46:06.962Z"), true, false)).toBe(' key="2014-12-28T16:46:06.962Z"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", new Date("2014-12-28T16:46:06.962Z"), false, false)).toBe(' key="2014-12-28T16:46:06.962Z"');

	// Custom JSON Attributes
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(
		attr(
			"key",
			{
				toJSON() {
					return "bar";
				},
			},
			true,
			false
		)
	).toBe(' key="bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(
		attr(
			"key",
			{
				toJSON() {
					return { foo: "bar" };
				},
			},
			true,
			false
		)
	).toBe(' key="{&quot;foo&quot;:&quot;bar&quot;}"');

	// JSON Attributes
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", { foo: "bar" }, true, true)).toBe(' key="{&quot;foo&quot;:&quot;bar&quot;}"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", { foo: "bar" }, false, true)).toBe(' key=\'{"foo":"bar"}\'');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", { foo: "don't" }, true, true)).toBe(' key="{&quot;foo&quot;:&quot;don\'t&quot;}"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", { foo: "don't" }, false, true)).toBe(' key=\'{"foo":"don&#39;t"}\'');

	// Number attributes
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", 500, true, true)).toBe(' key="500"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", 500, false, true)).toBe(' key="500"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", 500, true, false)).toBe(' key="500"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", 500, false, false)).toBe(' key="500"');

	// String attributes
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo", true, true)).toBe(' key="foo"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo", false, true)).toBe(' key="foo"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo", true, false)).toBe(' key="foo"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo", false, false)).toBe(' key="foo"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo>bar", true, true)).toBe(' key="foo&gt;bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo>bar", false, true)).toBe(' key="foo>bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo>bar", true, false)).toBe(' key="foo&gt;bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attr("key", "foo>bar", false, false)).toBe(' key="foo>bar"');

	// @ts-expect-error TS(2339): Property 'toJSON' does not exist on type 'String'.
	String.prototype.toJSON = stringToJSON;
});

addTest("attrs", (attrs: any) => {
	// (obj, terse)
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ foo: "bar" }, true)).toBe(' foo="bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ foo: "bar" }, false)).toBe(' foo="bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ foo: "bar", hoo: "boo" }, true)).toBe(' foo="bar" hoo="boo"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ foo: "bar", hoo: "boo" }, false)).toBe(' foo="bar" hoo="boo"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ foo: "" }, true)).toBe(' foo=""');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ foo: "" }, false)).toBe(' foo=""');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ class: "" }, true)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ class: "" }, false)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ class: ["foo", { bar: true }] }, true)).toBe(' class="foo bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ class: ["foo", { bar: true }] }, false)).toBe(' class="foo bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ class: ["foo", { bar: true }], foo: "bar" }, true)).toBe(' class="foo bar" foo="bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ foo: "bar", class: ["foo", { bar: true }] }, false)).toBe(' class="foo bar" foo="bar"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ style: "foo: bar;" }, true)).toBe(' style="foo: bar;"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ style: "foo: bar;" }, false)).toBe(' style="foo: bar;"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ style: { foo: "bar" } }, true)).toBe(' style="foo:bar;"');
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(attrs({ style: { foo: "bar" } }, false)).toBe(' style="foo:bar;"');
});

addTest("classes", (classes: any) => {
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(classes(["foo", "bar"])).toBe("foo bar");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(
		classes([
			["foo", "bar"],
			["baz", "bash"],
		])
	).toBe("foo bar baz bash");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(classes([["foo", "bar"], { baz: true, bash: false }])).toBe("foo bar baz");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(classes([["fo<o", "bar"], { "ba>z": true, bash: false }], [true, false])).toBe("fo&lt;o bar ba>z");
});

addTest("escape", (escape: any) => {
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(escape("foo")).toBe("foo");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(escape(10)).toBe(10);
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(escape("foo<bar")).toBe("foo&lt;bar");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(escape("foo&<bar")).toBe("foo&amp;&lt;bar");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(escape("foo&<>bar")).toBe("foo&amp;&lt;&gt;bar");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(escape('foo&<>"bar')).toBe("foo&amp;&lt;&gt;&quot;bar");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(escape('foo&<>"bar"')).toBe("foo&amp;&lt;&gt;&quot;bar&quot;");
});

addTest("merge", (merge: any) => {
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ foo: "bar" }, { baz: "bash" })).toEqual({ foo: "bar", baz: "bash" });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge([{ foo: "bar" }, { baz: "bash" }, { bing: "bong" }])).toEqual({
		foo: "bar",
		baz: "bash",
		bing: "bong",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ class: "bar" }, { class: "bash" })).toEqual({
		class: ["bar", "bash"],
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ class: ["bar"] }, { class: "bash" })).toEqual({
		class: ["bar", "bash"],
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ class: "bar" }, { class: ["bash"] })).toEqual({
		class: ["bar", "bash"],
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ class: "bar" }, { class: null })).toEqual({ class: ["bar"] });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ class: null }, { class: ["bar"] })).toEqual({ class: ["bar"] });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({}, { class: ["bar"] })).toEqual({ class: ["bar"] });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ class: ["bar"] }, {})).toEqual({ class: ["bar"] });

	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: "foo:bar" }, { style: "baz:bash" })).toEqual({
		style: "foo:bar;baz:bash;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: "foo:bar;" }, { style: "baz:bash" })).toEqual({
		style: "foo:bar;baz:bash;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: { foo: "bar" } }, { style: "baz:bash" })).toEqual({
		style: "foo:bar;baz:bash;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: { foo: "bar" } }, { style: { baz: "bash" } })).toEqual({
		style: "foo:bar;baz:bash;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: "foo:bar" }, { style: null })).toEqual({ style: "foo:bar;" });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: "foo:bar;" }, { style: null })).toEqual({
		style: "foo:bar;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: { foo: "bar" } }, { style: null })).toEqual({
		style: "foo:bar;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: null }, { style: "baz:bash" })).toEqual({
		style: "baz:bash;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: null }, { style: "baz:bash" })).toEqual({
		style: "baz:bash;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({ style: null }, { style: "baz:bash" })).toEqual({
		style: "baz:bash;",
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({}, { style: "baz:bash" })).toEqual({ style: "baz:bash;" });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({}, { style: "baz:bash" })).toEqual({ style: "baz:bash;" });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(merge({}, { style: "baz:bash" })).toEqual({ style: "baz:bash;" });
});

addTest("style", (style: any) => {
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(style(null)).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(style("")).toBe("");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(style("foo: bar")).toBe("foo: bar");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(style("foo: bar;")).toBe("foo: bar;");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(style({ foo: "bar" })).toBe("foo:bar;");
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(style({ foo: "bar", baz: "bash" })).toBe("foo:bar;baz:bash;");
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("rethrow", () => {
	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("should rethrow error", () => {
		const err = new Error();
		try {
			runtime.rethrow(err, "foo.pug", 3);
		} catch (e) {
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(e).toBe(err);
			return;
		}

		throw new Error("expected rethrow to throw");
	});

	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("should rethrow error with str", () => {
		const err = new Error();
		try {
			runtime.rethrow(err, "foo.pug", 3, "hello world");
		} catch (e) {
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(e).toBe(err);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(e.message.trim()).toBe(
				`
foo.pug:3
    1| hello world`.trim()
			);
			return;
		}

		throw new Error("expected rethrow to throw");
	});

	// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
	it("should handle bad arguments gracefully", () => {
		const err = new Error("hello world");
		const str = { not: "a string" };
		try {
			runtime.rethrow(err, "foo.pug", 3, str);
		} catch (e) {
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(e).toBe(err);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(e.message).toBe("hello world - could not read from foo.pug (str.split is not a function) on line 3");
			return;
		}

		throw new Error("expected rethrow to throw");
	});
});
