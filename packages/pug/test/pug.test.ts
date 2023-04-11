// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");

// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
const perfTest = fs.readFileSync(`${__dirname}/fixtures/perf.pug`, "utf8");

try {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	fs.mkdirSync(`${__dirname}/temp`);
} catch (ex) {
	// @ts-expect-error TS(2571): Object is of type 'unknown'.
	if (ex.code !== "EEXIST") {
		throw ex;
	}
}

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("pug", () => {
	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe("unit tests with .render()", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support doctypes", () => {
			assert.equal('<?xml version="1.0" encoding="utf-8" ?>', pug.render("doctype xml"));
			assert.equal("<!DOCTYPE html>", pug.render("doctype html"));
			assert.equal("<!DOCTYPE foo bar baz>", pug.render("doctype foo bar baz"));
			assert.equal("<!DOCTYPE html>", pug.render("doctype html"));
			assert.equal("<!DOCTYPE html>", pug.render("doctype", { doctype: "html" }));
			assert.equal("<!DOCTYPE html>", pug.render("doctype html", { doctype: "xml" }));
			assert.equal("<html></html>", pug.render("html"));
			assert.equal("<!DOCTYPE html><html></html>", pug.render("html", { doctype: "html" }));
			assert.equal(
				'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN>',
				pug.render('doctype html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN')
			);
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support Buffers", () => {
			// @ts-expect-error TS(2591): Cannot find name 'Buffer'. Do you need to install ... Remove this comment to see the full error message
			assert.equal("<p>foo</p>", pug.render(Buffer.from("p foo")));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support line endings", () => {
			const src = ["p", "div", "img"];

			let html = ["<p></p>", "<div></div>", "<img/>"].join("");

			assert.equal(html, pug.render(src.join("\n")));
			assert.equal(html, pug.render(src.join("\r")));
			assert.equal(html, pug.render(src.join("\r\n")));

			html = ["<p></p>", "<div></div>", "<img>"].join("");

			assert.equal(html, pug.render(src.join("\n"), { doctype: "html" }));
			assert.equal(html, pug.render(src.join("\r"), { doctype: "html" }));
			assert.equal(html, pug.render(src.join("\r\n"), { doctype: "html" }));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support single quotes", () => {
			assert.equal("<p>'foo'</p>", pug.render("p 'foo'"));
			assert.equal("<p>'foo'</p>", pug.render("p\n  | 'foo'"));
			assert.equal('<a href="/foo"></a>', pug.render("- var path = 'foo';\na(href='/' + path)"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support block-expansion", () => {
			assert.equal(
				"<li><a>foo</a></li><li><a>bar</a></li><li><a>baz</a></li>",
				pug.render("li: a foo\nli: a bar\nli: a baz")
			);
			assert.equal(
				'<li class="first"><a>foo</a></li><li><a>bar</a></li><li><a>baz</a></li>',
				pug.render("li.first: a foo\nli: a bar\nli: a baz")
			);
			assert.equal('<div class="foo"><div class="bar">baz</div></div>', pug.render(".foo: .bar baz"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support tags", () => {
			const str = ["p", "div", "img", "br/"].join("\n");

			const html = ["<p></p>", "<div></div>", "<img/>", "<br/>"].join("");

			assert.equal(html, pug.render(str), "Test basic tags");
			assert.equal("<fb:foo-bar></fb:foo-bar>", pug.render("fb:foo-bar"), "Test hyphens");
			assert.equal('<div class="something"></div>', pug.render("div.something"), "Test classes");
			assert.equal('<div id="something"></div>', pug.render("div#something"), "Test ids");
			assert.equal('<div class="something"></div>', pug.render(".something"), "Test stand-alone classes");
			assert.equal('<div id="something"></div>', pug.render("#something"), "Test stand-alone ids");
			assert.equal('<div class="bar" id="foo"></div>', pug.render("#foo.bar"));
			assert.equal('<div class="bar" id="foo"></div>', pug.render(".bar#foo"));
			assert.equal('<div class="bar" id="foo"></div>', pug.render('div#foo(class="bar")'));
			assert.equal('<div class="bar" id="foo"></div>', pug.render('div(class="bar")#foo'));
			assert.equal('<div class="foo" id="bar"></div>', pug.render('div(id="bar").foo'));
			assert.equal('<div class="foo bar baz"></div>', pug.render("div.foo.bar.baz"));
			assert.equal('<div class="foo bar baz"></div>', pug.render('div(class="foo").bar.baz'));
			assert.equal('<div class="foo bar baz"></div>', pug.render('div.foo(class="bar").baz'));
			assert.equal('<div class="foo bar baz"></div>', pug.render('div.foo.bar(class="baz")'));
			assert.equal('<div class="a-b2"></div>', pug.render("div.a-b2"));
			assert.equal('<div class="a_b2"></div>', pug.render("div.a_b2"));
			assert.equal("<fb:user></fb:user>", pug.render("fb:user"));
			assert.equal("<fb:user:role></fb:user:role>", pug.render("fb:user:role"));
			assert.equal('<colgroup><col class="test"/></colgroup>', pug.render("colgroup\n  col.test"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support nested tags", () => {
			var str = ["ul", "  li a", "  li b", "  li", "    ul", "      li c", "      li d", "  li e"].join("\n");

			var html = [
				"<ul>",
				"<li>a</li>",
				"<li>b</li>",
				"<li><ul><li>c</li><li>d</li></ul></li>",
				"<li>e</li>",
				"</ul>",
			].join("");

			assert.equal(html, pug.render(str));

			var str = ['a(href="#")', "  | foo ", "  | bar ", "  | baz"].join("\n");

			assert.equal('<a href="#">foo \nbar \nbaz</a>', pug.render(str));

			var str = ["ul", "  li one", "  ul", "    | two", "    li three"].join("\n");

			var html = ["<ul>", "<li>one</li>", "<ul>two", "<li>three</li>", "</ul>", "</ul>"].join("");

			assert.equal(html, pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support variable length newlines", () => {
			const str = [
				"ul",
				"  li a",
				"  ",
				"  li b",
				" ",
				"         ",
				"  li",
				"    ul",
				"      li c",
				"",
				"      li d",
				"  li e",
			].join("\n");

			const html = [
				"<ul>",
				"<li>a</li>",
				"<li>b</li>",
				"<li><ul><li>c</li><li>d</li></ul></li>",
				"<li>e</li>",
				"</ul>",
			].join("");

			assert.equal(html, pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support tab conversion", () => {
			const str = [
				"ul",
				"\tli a",
				"\t",
				"\tli b",
				"\t\t",
				"\t\t\t\t\t\t",
				"\tli",
				"\t\tul",
				"\t\t\tli c",
				"",
				"\t\t\tli d",
				"\tli e",
			].join("\n");

			const html = [
				"<ul>",
				"<li>a</li>",
				"<li>b</li>",
				"<li><ul><li>c</li><li>d</li></ul></li>",
				"<li>e</li>",
				"</ul>",
			].join("");

			assert.equal(html, pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support newlines", () => {
			var str = [
				"ul",
				"  li a",
				"  ",
				"    ",
				"",
				" ",
				"  li b",
				"  li",
				"    ",
				"        ",
				" ",
				"    ul",
				"      ",
				"      li c",
				"      li d",
				"  li e",
			].join("\n");

			var html = [
				"<ul>",
				"<li>a</li>",
				"<li>b</li>",
				"<li><ul><li>c</li><li>d</li></ul></li>",
				"<li>e</li>",
				"</ul>",
			].join("");

			assert.equal(html, pug.render(str));

			var str = ["html", " ", "  head", '    != "test"', "  ", "  ", "  ", "  body"].join("\n");

			var html = ["<html>", "<head>", "test", "</head>", "<body></body>", "</html>"].join("");

			assert.equal(html, pug.render(str));
			assert.equal("<foo></foo>something<bar></bar>", pug.render('foo\n= "something"\nbar'));
			assert.equal("<foo></foo>something<bar></bar>else", pug.render('foo\n= "something"\nbar\n= "else"'));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support text", () => {
			assert.equal("foo\nbar\nbaz", pug.render("| foo\n| bar\n| baz"));
			assert.equal("foo \nbar \nbaz", pug.render("| foo \n| bar \n| baz"));
			assert.equal("(hey)", pug.render("| (hey)"));
			assert.equal("some random text", pug.render("| some random text"));
			assert.equal("  foo", pug.render("|   foo"));
			assert.equal("  foo  ", pug.render("|   foo  "));
			assert.equal("  foo  \n bar    ", pug.render("|   foo  \n|  bar    "));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support pipe-less text", () => {
			assert.equal("<pre><code><foo></foo><bar></bar></code></pre>", pug.render("pre\n  code\n    foo\n\n    bar"));
			assert.equal("<p>foo\n\nbar</p>", pug.render("p.\n  foo\n\n  bar"));
			assert.equal("<p>foo\n\n\n\nbar</p>", pug.render("p.\n  foo\n\n\n\n  bar"));
			assert.equal("<p>foo\n  bar\nfoo</p>", pug.render("p.\n  foo\n    bar\n  foo"));
			assert.equal(
				"<script>s.parentNode.insertBefore(g,s)</script>",
				pug.render("script.\n  s.parentNode.insertBefore(g,s)\n")
			);
			assert.equal(
				"<script>s.parentNode.insertBefore(g,s)</script>",
				pug.render("script.\n  s.parentNode.insertBefore(g,s)")
			);
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support tag text", () => {
			assert.equal("<p>some random text</p>", pug.render("p some random text"));
			assert.equal("<p>click<a>Google</a>.</p>", pug.render("p\n  | click\n  a Google\n  | ."));
			assert.equal("<p>(parens)</p>", pug.render("p (parens)"));
			assert.equal('<p foo="bar">(parens)</p>', pug.render('p(foo="bar") (parens)'));
			assert.equal(
				'<option value="">-- (optional) foo --</option>',
				pug.render('option(value="") -- (optional) foo --')
			);
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support tag text block", () => {
			assert.equal("<p>foo \nbar \nbaz</p>", pug.render("p\n  | foo \n  | bar \n  | baz"));
			assert.equal("<label>Password:<input/></label>", pug.render("label\n  | Password:\n  input"));
			assert.equal("<label>Password:<input/></label>", pug.render("label Password:\n  input"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support tag text interpolation", () => {
			assert.equal("yo, pug is cool", pug.render("| yo, #{name} is cool\n", { name: "pug" }));
			assert.equal("<p>yo, pug is cool</p>", pug.render("p yo, #{name} is cool", { name: "pug" }));
			assert.equal("yo, pug is cool", pug.render('| yo, #{name || "pug"} is cool', { name: null }));
			assert.equal("yo, 'pug' is cool", pug.render("| yo, #{name || \"'pug'\"} is cool", { name: null }));
			assert.equal("foo &lt;script&gt; bar", pug.render("| foo #{code} bar", { code: "<script>" }));
			assert.equal("foo <script> bar", pug.render("| foo !{code} bar", { code: "<script>" }));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support flexible indentation", () => {
			assert.equal(
				"<html><body><h1>Wahoo</h1><p>test</p></body></html>",
				pug.render("html\n  body\n   h1 Wahoo\n   p test")
			);
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support interpolation values", () => {
			assert.equal("<p>Users: 15</p>", pug.render("p Users: #{15}"));
			assert.equal("<p>Users: </p>", pug.render("p Users: #{null}"));
			assert.equal("<p>Users: </p>", pug.render("p Users: #{undefined}"));
			assert.equal("<p>Users: none</p>", pug.render('p Users: #{undefined || "none"}'));
			assert.equal("<p>Users: 0</p>", pug.render("p Users: #{0}"));
			assert.equal("<p>Users: false</p>", pug.render("p Users: #{false}"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support test html 5 mode", () => {
			assert.equal(
				'<!DOCTYPE html><input type="checkbox" checked>',
				pug.render('doctype html\ninput(type="checkbox", checked)')
			);
			assert.equal(
				'<!DOCTYPE html><input type="checkbox" checked>',
				pug.render('doctype html\ninput(type="checkbox", checked=true)')
			);
			assert.equal(
				'<!DOCTYPE html><input type="checkbox">',
				pug.render('doctype html\ninput(type="checkbox", checked= false)')
			);
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support multi-line attrs", () => {
			assert.equal(
				'<a foo="bar" bar="baz" checked="checked">foo</a>',
				pug.render('a(foo="bar"\n  bar="baz"\n  checked) foo')
			);
			assert.equal(
				'<a foo="bar" bar="baz" checked="checked">foo</a>',
				pug.render('a(foo="bar"\nbar="baz"\nchecked) foo')
			);
			assert.equal(
				'<a foo="bar" bar="baz" checked="checked">foo</a>',
				pug.render('a(foo="bar"\n,bar="baz"\n,checked) foo')
			);
			assert.equal(
				'<a foo="bar" bar="baz" checked="checked">foo</a>',
				pug.render('a(foo="bar",\nbar="baz",\nchecked) foo')
			);
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support attrs", () => {
			assert.equal('<img src="&lt;script&gt;"/>', pug.render('img(src="<script>")'), "Test attr escaping");

			assert.equal('<a data-attr="bar"></a>', pug.render('a(data-attr="bar")'));
			assert.equal('<a data-attr="bar" data-attr-2="baz"></a>', pug.render('a(data-attr="bar", data-attr-2="baz")'));

			assert.equal('<a title="foo,bar"></a>', pug.render('a(title= "foo,bar")'));
			assert.equal('<a title="foo,bar" href="#"></a>', pug.render('a(title= "foo,bar", href="#")'));

			assert.equal('<p class="foo"></p>', pug.render("p(class='foo')"), "Test single quoted attrs");
			assert.equal('<input type="checkbox" checked="checked"/>', pug.render('input( type="checkbox", checked )'));
			assert.equal(
				'<input type="checkbox" checked="checked"/>',
				pug.render('input( type="checkbox", checked = true )')
			);
			assert.equal('<input type="checkbox"/>', pug.render('input(type="checkbox", checked= false)'));
			assert.equal('<input type="checkbox"/>', pug.render('input(type="checkbox", checked= null)'));
			assert.equal('<input type="checkbox"/>', pug.render('input(type="checkbox", checked= undefined)'));

			assert.equal('<img src="/foo.png"/>', pug.render('img(src="/foo.png")'), "Test attr =");
			assert.equal('<img src="/foo.png"/>', pug.render('img(src  =  "/foo.png")'), "Test attr = whitespace");
			assert.equal('<img src="/foo.png"/>', pug.render('img(src="/foo.png")'), "Test attr :");
			assert.equal('<img src="/foo.png"/>', pug.render('img(src  =  "/foo.png")'), "Test attr : whitespace");

			assert.equal('<img src="/foo.png" alt="just some foo"/>', pug.render('img(src="/foo.png", alt="just some foo")'));
			assert.equal(
				'<img src="/foo.png" alt="just some foo"/>',
				pug.render('img(src = "/foo.png", alt = "just some foo")')
			);

			assert.equal('<p class="foo,bar,baz"></p>', pug.render('p(class="foo,bar,baz")'));
			assert.equal(
				'<a href="http://google.com" title="Some : weird = title"></a>',
				pug.render('a(href= "http://google.com", title= "Some : weird = title")')
			);
			assert.equal('<label for="name"></label>', pug.render('label(for="name")'));
			assert.equal(
				'<meta name="viewport" content="width=device-width"/>',
				pug.render("meta(name= 'viewport', content='width=device-width')"),
				"Test attrs that contain attr separators"
			);
			assert.equal('<div style="color= white"></div>', pug.render("div(style='color= white')"));
			assert.equal('<div style="color: white"></div>', pug.render("div(style='color: white')"));
			assert.equal('<p class="foo"></p>', pug.render("p('class'='foo')"), "Test keys with single quotes");
			assert.equal('<p class="foo"></p>', pug.render("p(\"class\"= 'foo')"), "Test keys with double quotes");

			assert.equal('<p data-lang="en"></p>', pug.render('p(data-lang = "en")'));
			assert.equal('<p data-dynamic="true"></p>', pug.render('p("data-dynamic"= "true")'));
			assert.equal(
				'<p class="name" data-dynamic="true"></p>',
				pug.render('p("class"= "name", "data-dynamic"= "true")')
			);
			assert.equal('<p data-dynamic="true"></p>', pug.render("p('data-dynamic'= \"true\")"));
			assert.equal(
				'<p class="name" data-dynamic="true"></p>',
				pug.render("p('class'= \"name\", 'data-dynamic'= \"true\")")
			);
			assert.equal(
				'<p class="name" data-dynamic="true" yay="yay"></p>',
				pug.render("p('class'= \"name\", 'data-dynamic'= \"true\", yay)")
			);

			assert.equal('<input checked="checked" type="checkbox"/>', pug.render('input(checked, type="checkbox")'));

			assert.equal(
				"<a data-foo=\"{ foo: 'bar', bar= 'baz' }\"></a>",
				pug.render("a(data-foo  = \"{ foo: 'bar', bar= 'baz' }\")")
			);

			assert.equal(
				'<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>',
				pug.render('meta(http-equiv="X-UA-Compatible", content="IE=edge,chrome=1")')
			);

			assert.equal(
				'<div style="background: url(/images/test.png)">Foo</div>',
				pug.render("div(style= 'background: url(/images/test.png)') Foo")
			);
			assert.equal(
				'<div style="background = url(/images/test.png)">Foo</div>',
				pug.render("div(style= 'background = url(/images/test.png)') Foo")
			);
			assert.equal('<div style="foo">Foo</div>', pug.render("div(style= ['foo', 'bar'][0]) Foo"));
			assert.equal('<div style="bar">Foo</div>', pug.render("div(style= { foo: 'bar', baz: 'raz' }['foo']) Foo"));
			assert.equal('<a href="def">Foo</a>', pug.render("a(href='abcdefg'.substr(3,3)) Foo"));
			assert.equal('<a href="def">Foo</a>', pug.render("a(href={test: 'abcdefg'}.test.substr(3,3)) Foo"));
			assert.equal('<a href="def">Foo</a>', pug.render("a(href={test: 'abcdefg'}.test.substr(3,[0,3][1])) Foo"));

			assert.equal('<rss xmlns:atom="atom"></rss>', pug.render('rss(xmlns:atom="atom")'));
			assert.equal('<rss xmlns:atom="atom"></rss>', pug.render("rss('xmlns:atom'=\"atom\")"));
			assert.equal('<rss xmlns:atom="atom"></rss>', pug.render("rss(\"xmlns:atom\"='atom')"));
			assert.equal('<rss xmlns:atom="atom" foo="bar"></rss>', pug.render("rss('xmlns:atom'=\"atom\", 'foo'= 'bar')"));
			assert.equal("<a data-obj=\"{ foo: 'bar' }\"></a>", pug.render("a(data-obj= \"{ foo: 'bar' }\")"));

			assert.equal("<meta content=\"what's up? 'weee'\"/>", pug.render("meta(content=\"what's up? 'weee'\")"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support class attr array", () => {
			assert.equal('<body class="foo bar baz"></body>', pug.render('body(class=["foo", "bar", "baz"])'));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support attr parens", () => {
			assert.equal('<p foo="bar">baz</p>', pug.render('p(foo=((("bar"))))= ((("baz")))'));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support code attrs", () => {
			assert.equal("<p></p>", pug.render("p(id= name)", { name: undefined }));
			assert.equal("<p></p>", pug.render("p(id= name)", { name: null }));
			assert.equal("<p></p>", pug.render("p(id= name)", { name: false }));
			assert.equal('<p id=""></p>', pug.render("p(id= name)", { name: "" }));
			assert.equal('<p id="tj"></p>', pug.render("p(id= name)", { name: "tj" }));
			assert.equal('<p id="default"></p>', pug.render('p(id= name || "default")', { name: null }));
			assert.equal('<p id="something"></p>', pug.render("p(id= 'something')", { name: null }));
			assert.equal('<p id="something"></p>', pug.render("p(id = 'something')", { name: null }));
			assert.equal('<p id="foo"></p>', pug.render("p(id= (true ? 'foo' : 'bar'))"));
			assert.equal('<option value="">Foo</option>', pug.render("option(value='') Foo"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support code attrs class", () => {
			assert.equal('<p class="tj"></p>', pug.render("p(class= name)", { name: "tj" }));
			assert.equal('<p class="tj"></p>', pug.render("p( class= name )", { name: "tj" }));
			assert.equal('<p class="default"></p>', pug.render('p(class= name || "default")', { name: null }));
			assert.equal('<p class="foo default"></p>', pug.render('p.foo(class= name || "default")', { name: null }));
			assert.equal('<p class="default foo"></p>', pug.render('p(class= name || "default").foo', { name: null }));
			assert.equal('<p id="default"></p>', pug.render('p(id = name || "default")', { name: null }));
			assert.equal('<p id="user-1"></p>', pug.render('p(id = "user-" + 1)'));
			assert.equal('<p class="user-1"></p>', pug.render('p(class = "user-" + 1)'));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support code buffering", () => {
			assert.equal("<p></p>", pug.render("p= null"));
			assert.equal("<p></p>", pug.render("p= undefined"));
			assert.equal("<p>0</p>", pug.render("p= 0"));
			assert.equal("<p>false</p>", pug.render("p= false"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support script text", () => {
			const str = [
				"script.",
				"  p foo",
				"",
				'script(type="text/template")',
				"  p foo",
				"",
				'script(type="text/template").',
				"  p foo",
			].join("\n");

			const html = [
				"<script>p foo\n</script>",
				'<script type="text/template"><p>foo</p></script>',
				'<script type="text/template">p foo</script>',
			].join("");

			assert.equal(html, pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support comments", () => {
			// Regular
			var str = ["//foo", "p bar"].join("\n");

			var html = ["<!--foo-->", "<p>bar</p>"].join("");

			assert.equal(html, pug.render(str));

			// Between tags

			var str = ["p foo", "// bar ", "p baz"].join("\n");

			var html = ["<p>foo</p>", "<!-- bar -->", "<p>baz</p>"].join("");

			assert.equal(html, pug.render(str));

			// Quotes

			var str = "<!-- script(src: '/js/validate.js') -->",
				js = "// script(src: '/js/validate.js') ";
			assert.equal(str, pug.render(js));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support unbuffered comments", () => {
			var str = ["//- foo", "p bar"].join("\n");

			var html = ["<p>bar</p>"].join("");

			assert.equal(html, pug.render(str));

			var str = ["p foo", "//- bar ", "p baz"].join("\n");

			var html = ["<p>foo</p>", "<p>baz</p>"].join("");

			assert.equal(html, pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support literal html", () => {
			assert.equal("<!--[if IE lt 9]>weeee<![endif]-->", pug.render("<!--[if IE lt 9]>weeee<![endif]-->"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support code", () => {
			assert.equal("test", pug.render('!= "test"'));
			assert.equal("test", pug.render('= "test"'));
			assert.equal("test", pug.render('- var foo = "test"\n=foo'));
			assert.equal("foo<em>test</em>bar", pug.render('- var foo = "test"\n| foo\nem= foo\n| bar'));
			assert.equal("test<h2>something</h2>", pug.render('!= "test"\nh2 something'));

			var str = ['- var foo = "<script>";', "= foo", "!= foo"].join("\n");

			var html = ["&lt;script&gt;", "<script>"].join("");

			assert.equal(html, pug.render(str));

			var str = ['- var foo = "<script>";', "- if (foo)", "  p= foo"].join("\n");

			var html = ["<p>&lt;script&gt;</p>"].join("");

			assert.equal(html, pug.render(str));

			var str = ['- var foo = "<script>";', "- if (foo)", "  p!= foo"].join("\n");

			var html = ["<p><script></p>"].join("");

			assert.equal(html, pug.render(str));

			var str = ["- var foo;", "- if (foo)", "  p.hasFoo= foo", "- else", "  p.noFoo no foo"].join("\n");

			var html = ['<p class="noFoo">no foo</p>'].join("");

			assert.equal(html, pug.render(str));

			var str = [
				"- var foo;",
				"- if (foo)",
				"  p.hasFoo= foo",
				"- else if (true)",
				"  p kinda foo",
				"- else",
				"  p.noFoo no foo",
			].join("\n");

			var html = ["<p>kinda foo</p>"].join("");

			assert.equal(html, pug.render(str));

			var str = ["p foo", '= "bar"'].join("\n");

			var html = ["<p>foo</p>bar"].join("");

			assert.equal(html, pug.render(str));

			var str = ["title foo", "- if (true)", "  p something"].join("\n");

			var html = ["<title>foo</title><p>something</p>"].join("");

			assert.equal(html, pug.render(str));

			var str = ["foo", '  bar= "bar"', '    baz= "baz"'].join("\n");

			var html = ["<foo>", "<bar>bar", "<baz>baz</baz>", "</bar>", "</foo>"].join("");

			assert.equal(html, pug.render(str));

			var str = ["-", "  var a =", "    5;", "p= a"].join("\n");

			var html = ["<p>5</p>"].join("");

			assert.equal(html, pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support each", () => {
			// Array
			var str = ['- var items = ["one", "two", "three"];', "each item in items", "  li= item"].join("\n");

			var html = ["<li>one</li>", "<li>two</li>", "<li>three</li>"].join("");

			assert.equal(html, pug.render(str));

			// Any enumerable (length property)
			var str = ["- var jQuery = { length: 3, 0: 1, 1: 2, 2: 3 };", "each item in jQuery", "  li= item"].join("\n");

			var html = ["<li>1</li>", "<li>2</li>", "<li>3</li>"].join("");

			assert.equal(html, pug.render(str));

			// Empty array
			var str = ["- var items = [];", "each item in items", "  li= item"].join("\n");

			assert.equal("", pug.render(str));

			// Object
			var str = ['- var obj = { foo: "bar", baz: "raz" };', "each val in obj", "  li= val"].join("\n");

			var html = ["<li>bar</li>", "<li>raz</li>"].join("");

			assert.equal(html, pug.render(str));

			// Complex
			var str = ['- var obj = { foo: "bar", baz: "raz" };', "each key in Object.keys(obj)", "  li= key"].join("\n");

			var html = ["<li>foo</li>", "<li>baz</li>"].join("");

			assert.equal(html, pug.render(str));

			// Keys
			var str = ['- var obj = { foo: "bar", baz: "raz" };', "each val, key in obj", "  li #{key}: #{val}"].join("\n");

			var html = ["<li>foo: bar</li>", "<li>baz: raz</li>"].join("");

			assert.equal(html, pug.render(str));

			// Nested
			var str = [
				'- var users = [{ name: "tj" }]',
				"each user in users",
				"  each val, key in user",
				"    li #{key} #{val}",
			].join("\n");

			var html = ["<li>name tj</li>"].join("");

			assert.equal(html, pug.render(str));

			var str = ['- var users = ["tobi", "loki", "jane"]', "each user in users", "  li= user"].join("\n");

			var html = ["<li>tobi</li>", "<li>loki</li>", "<li>jane</li>"].join("");

			assert.equal(html, pug.render(str));

			var str = ['- var users = ["tobi", "loki", "jane"]', "for user in users", "  li= user"].join("\n");

			var html = ["<li>tobi</li>", "<li>loki</li>", "<li>jane</li>"].join("");

			assert.equal(html, pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support if", () => {
			const str = ['- var users = ["tobi", "loki", "jane"]', "if users.length", "  p users: #{users.length}"].join(
				"\n"
			);

			assert.equal("<p>users: 3</p>", pug.render(str));

			assert.equal('<iframe foo="bar"></iframe>', pug.render('iframe(foo="bar")'));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support unless", () => {
			var str = ['- var users = ["tobi", "loki", "jane"]', "unless users.length", "  p no users"].join("\n");

			assert.equal("", pug.render(str));

			var str = ["- var users = []", "unless users.length", "  p no users"].join("\n");

			assert.equal("<p>no users</p>", pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support else", () => {
			const str = ["- var users = []", "if users.length", "  p users: #{users.length}", "else", "  p users: none"].join(
				"\n"
			);

			assert.equal("<p>users: none</p>", pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should else if", () => {
			const str = [
				'- var users = ["tobi", "jane", "loki"]',
				"for user in users",
				'  if user == "tobi"',
				"    p awesome #{user}",
				'  else if user == "jane"',
				"    p lame #{user}",
				"  else",
				"    p #{user}",
			].join("\n");

			assert.equal("<p>awesome tobi</p><p>lame jane</p><p>loki</p>", pug.render(str));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should include block", () => {
			const str = ["html", "  head", "    include fixtures/scripts.pug", '      scripts(src="/app.js")'].join("\n");

			assert.equal(
				'<html><head><script src="/jquery.js"></script><script src="/caustic.js"></script><scripts src="/app.js"></scripts></head></html>',
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				pug.render(str, { filename: `${__dirname}/pug.test.js` })
			);
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should not fail on js newlines", () => {
			assert.equal("<p>foo\u2028bar</p>", pug.render("p foo\u2028bar"));
			assert.equal("<p>foo\u2029bar</p>", pug.render("p foo\u2029bar"));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should display error line number correctly up to token level", () => {
			const str = [
				"p.",
				"  Lorem ipsum dolor sit amet, consectetur",
				"  adipisicing elit, sed do eiusmod tempor",
				"  incididunt ut labore et dolore magna aliqua.",
				"p.",
				"  Ut enim ad minim veniam, quis nostrud",
				"  exercitation ullamco laboris nisi ut aliquip",
				"  ex ea commodo consequat.",
				"p.",
				"  Duis aute irure dolor in reprehenderit",
				"  in voluptate velit esse cillum dolore eu",
				"  fugiat nulla pariatur.",
				'a(href="#" Next',
			].join("\n");
			const errorLocation = function (str: any) {
				try {
					pug.render(str);
				} catch (err) {
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					return err.message.split("\n")[0];
				}
			};
			assert.equal(errorLocation(str), "Pug:13:16");
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".compileFile()", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("does not produce warnings for issue-1593", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			pug.compileFile(`${__dirname}/fixtures/issue-1593/index.pug`);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support caching (pass 1)", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-compileFile.pug`, ".foo bar");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const fn = pug.compileFile(`${__dirname}/temp/input-compileFile.pug`, {
				cache: true,
			});
			const expected = '<div class="foo">bar</div>';
			assert(fn() === expected);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support caching (pass 2)", () => {
			// Poison the input file
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-compileFile.pug`, ".big fat hen");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const fn = pug.compileFile(`${__dirname}/temp/input-compileFile.pug`, {
				cache: true,
			});
			const expected = '<div class="foo">bar</div>';
			assert(fn() === expected);
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".render()", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .pug.render(str, fn)", () => {
			pug.render("p foo bar", (err: any, str: any) => {
				assert.ok(!err);
				assert.equal("<p>foo bar</p>", str);
			});
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .pug.render(str, options, fn)", () => {
			pug.render("p #{foo}", { foo: "bar" }, (err: any, str: any) => {
				assert.ok(!err);
				assert.equal("<p>bar</p>", str);
			});
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .pug.render(str, options, fn) cache", () => {
			// @ts-expect-error TS(6133): 'str' is declared but its value is never read.
			pug.render("p bar", { cache: true }, (err: any, str: any) => {
				assert.ok(/the "filename" option is required for caching/.test(err.message));
			});

			pug.render("p foo bar", { cache: true, filename: "test" }, (err: any, str: any) => {
				assert.ok(!err);
				assert.equal("<p>foo bar</p>", str);
			});
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".compile()", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .compile()", () => {
			const fn = pug.compile("p foo");
			assert.equal("<p>foo</p>", fn());
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .compile() locals", () => {
			const fn = pug.compile("p= foo");
			assert.equal("<p>bar</p>", fn({ foo: "bar" }));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .compile() locals in 'self' hash", () => {
			const fn = pug.compile("p= self.foo", { self: true });
			assert.equal("<p>bar</p>", fn({ foo: "bar" }));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .compile() no debug", () => {
			const fn = pug.compile("p foo\np #{bar}", { compileDebug: false });
			assert.equal("<p>foo</p><p>baz</p>", fn({ bar: "baz" }));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support .compile() no debug and global helpers", () => {
			const fn = pug.compile("p foo\np #{bar}", {
				compileDebug: false,
				helpers: "global",
			});
			assert.equal("<p>foo</p><p>baz</p>", fn({ bar: "baz" }));
		});

		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should be reasonably fast", () => {
			pug.compile(perfTest, {});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("allows trailing space (see #1586)", () => {
			const res = pug.render("ul \n  li An Item");
			assert.equal("<ul> <li>An Item</li></ul>", res);
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".compileClient()", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support pug.compileClient(str)", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const src = fs.readFileSync(`${__dirname}/cases/basic.pug`);
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const expected = fs.readFileSync(`${__dirname}/cases/basic.html`, "utf8").replace(/\s/g, "");
			let fn = pug.compileClient(src);
			fn = Function("pug", `${fn.toString()}\nreturn template;`)(pug.runtime);
			const actual = fn({ name: "foo" }).replace(/\s/g, "");
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(actual).toBe(expected);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support pug.compileClient(str, options)", () => {
			const src = ".bar= self.foo";
			let fn = pug.compileClient(src, { self: true });
			fn = Function("pug", `${fn.toString()}\nreturn template;`)(pug.runtime);
			const actual = fn({ foo: "baz" });
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(actual).toBe('<div class="bar">baz</div>');
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support module syntax in pug.compileClient(str, options) when inlineRuntimeFunctions it true", () => {
			const src = ".bar= self.foo";
			var fn = pug.compileClient(src, {
				self: true,
				module: true,
				inlineRuntimeFunctions: true,
			});
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(fn).toMatchSnapshot();
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-compileModuleFileClient.js`, fn);
			// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
			var fn = require(`${__dirname}/temp/input-compileModuleFileClient.js`);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(fn({ foo: "baz" })).toBe('<div class="bar">baz</div>');
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support module syntax in pug.compileClient(str, options) when inlineRuntimeFunctions it false", () => {
			const src = ".bar= self.foo";
			var fn = pug.compileClient(src, {
				self: true,
				module: true,
				inlineRuntimeFunctions: false,
			});
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(fn).toMatchSnapshot();
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-compileModuleFileClient.js`, fn);
			// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
			var fn = require(`${__dirname}/temp/input-compileModuleFileClient.js`);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(fn({ foo: "baz" })).toBe('<div class="bar">baz</div>');
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".renderFile()", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("will synchronously return a string", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const expected = fs.readFileSync(`${__dirname}/cases/basic.html`, "utf8").replace(/\s/g, "");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const actual = pug.renderFile(`${__dirname}/cases/basic.pug`, { name: "foo" }).replace(/\s/g, "");
			assert(actual === expected);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("when given a callback, it calls that rather than returning", (done: any) => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const expected = fs.readFileSync(`${__dirname}/cases/basic.html`, "utf8").replace(/\s/g, "");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			pug.renderFile(`${__dirname}/cases/basic.pug`, { name: "foo" }, (err: any, actual: any) => {
				if (err) return done(err);
				assert(actual.replace(/\s/g, "") === expected);
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("when given a callback, it calls that rather than returning even if there are no options", (done: any) => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const expected = fs.readFileSync(`${__dirname}/cases/basic.html`, "utf8").replace(/\s/g, "");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			pug.renderFile(`${__dirname}/cases/basic.pug`, (err: any, actual: any) => {
				if (err) return done(err);
				assert(actual.replace(/\s/g, "") === expected);
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("when given a callback, it calls that with any errors", (done: any) => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			pug.renderFile(`${__dirname}/fixtures/runtime.error.pug`, (err: any, actual: any) => {
				assert.ok(err);
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support caching (pass 1)", (done: any) => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-renderFile.pug`, ".foo bar");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			pug.renderFile(`${__dirname}/temp/input-renderFile.pug`, { cache: true }, (err: any, actual: any) => {
				if (err) return done(err);
				assert.equal('<div class="foo">bar</div>', actual);
				done();
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support caching (pass 2)", (done: any) => {
			// Poison the input file
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-renderFile.pug`, ".big fat hen");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			pug.renderFile(`${__dirname}/temp/input-renderFile.pug`, { cache: true }, (err: any, actual: any) => {
				if (err) return done(err);
				assert.equal('<div class="foo">bar</div>', actual);
				done();
			});
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".compileFileClient(path, options)", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("returns a string form of a function called `template`", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const src = pug.compileFileClient(`${__dirname}/cases/basic.pug`);
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const expected = fs.readFileSync(`${__dirname}/cases/basic.html`, "utf8").replace(/\s/g, "");
			const fn = Function("pug", `${src}\nreturn template;`)(pug.runtime);
			const actual = fn({ name: "foo" }).replace(/\s/g, "");
			assert(actual === expected);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("accepts the `name` option to rename the resulting function", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const src = pug.compileFileClient(`${__dirname}/cases/basic.pug`, {
				name: "myTemplateName",
			});
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const expected = fs.readFileSync(`${__dirname}/cases/basic.html`, "utf8").replace(/\s/g, "");
			const fn = Function("pug", `${src}\nreturn myTemplateName;`)(pug.runtime);
			const actual = fn({ name: "foo" }).replace(/\s/g, "");
			assert(actual === expected);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support caching (pass 1)", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-compileFileClient.pug`, ".foo bar");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const src = pug.compileFileClient(`${__dirname}/temp/input-compileFileClient.pug`, {
				name: "myTemplateName",
				cache: true,
			});
			const expected = '<div class="foo">bar</div>';
			const fn = Function("pug", `${src}\nreturn myTemplateName;`)(pug.runtime);
			assert(fn() === expected);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should support caching (pass 2)", () => {
			// Poison the input file
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			fs.writeFileSync(`${__dirname}/temp/input-compileFileClient.pug`, ".big fat hen");
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const src = pug.compileFileClient(`${__dirname}/temp/input-compileFileClient.pug`, {
				name: "myTemplateName",
				cache: true,
			});
			const expected = '<div class="foo">bar</div>';
			const fn = Function("pug", `${src}\nreturn myTemplateName;`)(pug.runtime);
			assert(fn() === expected);
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".runtime", () => {
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe(".merge", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("merges two attribute objects, giving precedensce to the second object", () => {
				assert.deepEqual(pug.runtime.merge({}, { class: ["foo", "bar"], foo: "bar" }), {
					class: ["foo", "bar"],
					foo: "bar",
				});
				assert.deepEqual(pug.runtime.merge({ class: ["foo"], foo: "baz" }, { class: ["bar"], foo: "bar" }), {
					class: ["foo", "bar"],
					foo: "bar",
				});
				assert.deepEqual(pug.runtime.merge({ class: ["foo", "bar"], foo: "bar" }, {}), {
					class: ["foo", "bar"],
					foo: "bar",
				});
			});
		});
		// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
		describe(".attrs", () => {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it("Renders the given attributes object", () => {
				assert.equal(pug.runtime.attrs({}), "");
				assert.equal(pug.runtime.attrs({ class: [] }), "");
				assert.equal(pug.runtime.attrs({ class: ["foo"] }), ' class="foo"');
				assert.equal(pug.runtime.attrs({ class: ["foo"], id: "bar" }), ' class="foo" id="bar"');
			});
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe("filter indentation", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("is maintained", () => {
			const filters = {
				indents(str: any) {
					return str
						.split(/\n/)
						.map((line: any) => {
							return line.match(/^ */)[0].length;
						})
						.join(",");
				},
			};

			const indents = [
				":indents",
				"  x",
				"   x",
				"    x",
				"     x",
				"  x",
				"      x",
				"      x",
				"     x",
				"     x",
				"      x",
				"    x",
				"  x",
				"    x",
				"  x",
				"   x",
			].join("\n");

			assert.equal(pug.render(indents, { filters }), "0,1,2,3,0,4,4,3,3,4,2,0,2,0,1");
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".compile().dependencies", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should list the filename of the template referenced by extends", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const filename = `${__dirname}/dependencies/extends1.pug`;
			const str = fs.readFileSync(filename, "utf8");
			const info = pug.compile(str, { filename });
			// @ts-expect-error TS(2339): Property 'resolve' does not exist on type 'string'... Remove this comment to see the full error message
			assert.deepEqual([path.resolve(`${__dirname}/dependencies/dependency1.pug`)], info.dependencies);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should list the filename of the template referenced by an include", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const filename = `${__dirname}/dependencies/include1.pug`;
			const str = fs.readFileSync(filename, "utf8");
			const info = pug.compile(str, { filename });
			// @ts-expect-error TS(2339): Property 'resolve' does not exist on type 'string'... Remove this comment to see the full error message
			assert.deepEqual([path.resolve(`${__dirname}/dependencies/dependency1.pug`)], info.dependencies);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should list the dependencies of extends dependencies", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const filename = `${__dirname}/dependencies/extends2.pug`;
			const str = fs.readFileSync(filename, "utf8");
			const info = pug.compile(str, { filename });
			assert.deepEqual(
				[
					// @ts-expect-error TS(2339): Property 'resolve' does not exist on type 'string'... Remove this comment to see the full error message
					path.resolve(`${__dirname}/dependencies/dependency2.pug`),
					// @ts-expect-error TS(2339): Property 'resolve' does not exist on type 'string'... Remove this comment to see the full error message
					path.resolve(`${__dirname}/dependencies/dependency3.pug`),
				],
				info.dependencies
			);
		});
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should list the dependencies of include dependencies", () => {
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			const filename = `${__dirname}/dependencies/include2.pug`;
			const str = fs.readFileSync(filename, "utf8");
			const info = pug.compile(str, { filename });
			assert.deepEqual(
				[
					// @ts-expect-error TS(2339): Property 'resolve' does not exist on type 'string'... Remove this comment to see the full error message
					path.resolve(`${__dirname}/dependencies/dependency2.pug`),
					// @ts-expect-error TS(2339): Property 'resolve' does not exist on type 'string'... Remove this comment to see the full error message
					path.resolve(`${__dirname}/dependencies/dependency3.pug`),
				],
				info.dependencies
			);
		});
	});

	// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
	describe(".name", () => {
		// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
		it("should have a name attribute", () => {
			assert.strictEqual(pug.name, "Pug");
		});
	});
});
