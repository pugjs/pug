'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var jade = require('../');

var perfTest = fs.readFileSync(__dirname + '/fixtures/perf.jade', 'utf8')

try {
  fs.mkdirSync(__dirname + '/temp');
} catch (ex) {
  if (ex.code !== 'EEXIST') {
    throw ex;
  }
}

describe('jade', function(){

  describe('.properties', function(){
    it('should have exports', function(){
      assert.equal('object', typeof jade.selfClosing, 'exports.selfClosing missing');
      assert.equal('object', typeof jade.doctypes, 'exports.doctypes missing');
      assert.equal('function', typeof jade.filters, 'exports.filters missing');
      assert.equal('object', typeof jade.utils, 'exports.utils missing');
      assert.equal('function', typeof jade.Compiler, 'exports.Compiler missing');
    });
  });

  describe('unit tests with .render()', function(){
    it('should support doctypes', function(){
      assert.equal('<?xml version="1.0" encoding="utf-8" ?>', jade.render('doctype xml'));
      assert.equal('<!DOCTYPE html>', jade.render('doctype html'));
      assert.equal('<!DOCTYPE foo bar baz>', jade.render('doctype foo bar baz'));
      assert.equal('<!DOCTYPE html>', jade.render('doctype html'));
      assert.equal('<!DOCTYPE html>', jade.render('doctype', { doctype:'html' }));
      assert.equal('<!DOCTYPE html>', jade.render('doctype html', { doctype:'xml' }));
      assert.equal('<html></html>', jade.render('html'));
      assert.equal('<!DOCTYPE html><html></html>', jade.render('html', { doctype:'html' }));
      assert.equal('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN>', jade.render('doctype html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN'));
    });

    it('should support Buffers', function(){
      assert.equal('<p>foo</p>', jade.render(new Buffer('p foo')));
    });

    it('should support line endings', function(){
      var src = [
          'p',
          'div',
          'img'
      ];

      var html = [
          '<p></p>',
          '<div></div>',
          '<img/>'
      ].join('');

      assert.equal(html, jade.render(src.join('\n')));
      assert.equal(html, jade.render(src.join('\r')));
      assert.equal(html, jade.render(src.join('\r\n')));

      html = [
          '<p></p>',
          '<div></div>',
          '<img>'
      ].join('');

      assert.equal(html, jade.render(src.join('\n'), { doctype:'html' }));
      assert.equal(html, jade.render(src.join('\r'), { doctype:'html' }));
      assert.equal(html, jade.render(src.join('\r\n'), { doctype:'html' }));
    });

    it('should support single quotes', function(){
      assert.equal("<p>'foo'</p>", jade.render("p 'foo'"));
      assert.equal("<p>'foo'</p>", jade.render("p\n  | 'foo'"));
      assert.equal('<a href="/foo"></a>', jade.render("- var path = 'foo';\na(href='/' + path)"));
    });

    it('should support block-expansion', function(){
      assert.equal("<li><a>foo</a></li><li><a>bar</a></li><li><a>baz</a></li>", jade.render("li: a foo\nli: a bar\nli: a baz"));
      assert.equal("<li class=\"first\"><a>foo</a></li><li><a>bar</a></li><li><a>baz</a></li>", jade.render("li.first: a foo\nli: a bar\nli: a baz"));
      assert.equal('<div class="foo"><div class="bar">baz</div></div>', jade.render(".foo: .bar baz"));
    });

    it('should support tags', function(){
      var str = [
          'p',
          'div',
          'img'
      ].join('\n');

      var html = [
          '<p></p>',
          '<div></div>',
          '<img/>'
      ].join('');

      assert.equal(html, jade.render(str), 'Test basic tags');
      assert.equal('<fb:foo-bar></fb:foo-bar>', jade.render('fb:foo-bar'), 'Test hyphens');
      assert.equal('<div class="something"></div>', jade.render('div.something'), 'Test classes');
      assert.equal('<div id="something"></div>', jade.render('div#something'), 'Test ids');
      assert.equal('<div class="something"></div>', jade.render('.something'), 'Test stand-alone classes');
      assert.equal('<div id="something"></div>', jade.render('#something'), 'Test stand-alone ids');
      assert.equal('<div id="foo" class="bar"></div>', jade.render('#foo.bar'));
      assert.equal('<div id="foo" class="bar"></div>', jade.render('.bar#foo'));
      assert.equal('<div id="foo" class="bar"></div>', jade.render('div#foo(class="bar")'));
      assert.equal('<div id="foo" class="bar"></div>', jade.render('div(class="bar")#foo'));
      assert.equal('<div id="bar" class="foo"></div>', jade.render('div(id="bar").foo'));
      assert.equal('<div class="foo bar baz"></div>', jade.render('div.foo.bar.baz'));
      assert.equal('<div class="foo bar baz"></div>', jade.render('div(class="foo").bar.baz'));
      assert.equal('<div class="foo bar baz"></div>', jade.render('div.foo(class="bar").baz'));
      assert.equal('<div class="foo bar baz"></div>', jade.render('div.foo.bar(class="baz")'));
      assert.equal('<div class="a-b2"></div>', jade.render('div.a-b2'));
      assert.equal('<div class="a_b2"></div>', jade.render('div.a_b2'));
      assert.equal('<fb:user></fb:user>', jade.render('fb:user'));
      assert.equal('<fb:user:role></fb:user:role>', jade.render('fb:user:role'));
      assert.equal('<colgroup><col class="test"/></colgroup>', jade.render('colgroup\n  col.test'));
    });

    it('should support nested tags', function(){
      var str = [
          'ul',
          '  li a',
          '  li b',
          '  li',
          '    ul',
          '      li c',
          '      li d',
          '  li e',
      ].join('\n');

      var html = [
          '<ul>',
          '<li>a</li>',
          '<li>b</li>',
          '<li><ul><li>c</li><li>d</li></ul></li>',
          '<li>e</li>',
          '</ul>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          'a(href="#")',
          '  | foo ',
          '  | bar ',
          '  | baz'
      ].join('\n');

      assert.equal('<a href="#">foo \nbar \nbaz</a>', jade.render(str));

      var str = [
          'ul',
          '  li one',
          '  ul',
          '    | two',
          '    li three'
      ].join('\n');

      var html = [
          '<ul>',
          '<li>one</li>',
          '<ul>two',
          '<li>three</li>',
          '</ul>',
          '</ul>'
      ].join('');

      assert.equal(html, jade.render(str));
    });

    it('should support variable length newlines', function(){
      var str = [
          'ul',
          '  li a',
          '  ',
          '  li b',
          ' ',
          '         ',
          '  li',
          '    ul',
          '      li c',
          '',
          '      li d',
          '  li e',
      ].join('\n');

      var html = [
          '<ul>',
          '<li>a</li>',
          '<li>b</li>',
          '<li><ul><li>c</li><li>d</li></ul></li>',
          '<li>e</li>',
          '</ul>'
      ].join('');

      assert.equal(html, jade.render(str));
    });

    it('should support tab conversion', function(){
      var str = [
          'ul',
          '\tli a',
          '\t',
          '\tli b',
          '\t\t',
          '\t\t\t\t\t\t',
          '\tli',
          '\t\tul',
          '\t\t\tli c',
          '',
          '\t\t\tli d',
          '\tli e',
      ].join('\n');

      var html = [
          '<ul>',
          '<li>a</li>',
          '<li>b</li>',
          '<li><ul><li>c</li><li>d</li></ul></li>',
          '<li>e</li>',
          '</ul>'
      ].join('');

      assert.equal(html, jade.render(str));
    });

    it('should support newlines', function(){
      var str = [
          'ul',
          '  li a',
          '  ',
          '    ',
          '',
          ' ',
          '  li b',
          '  li',
          '    ',
          '        ',
          ' ',
          '    ul',
          '      ',
          '      li c',
          '      li d',
          '  li e',
      ].join('\n');

      var html = [
          '<ul>',
          '<li>a</li>',
          '<li>b</li>',
          '<li><ul><li>c</li><li>d</li></ul></li>',
          '<li>e</li>',
          '</ul>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          'html',
          ' ',
          '  head',
          '    != "test"',
          '  ',
          '  ',
          '  ',
          '  body'
      ].join('\n');

      var html = [
          '<html>',
          '<head>',
          'test',
          '</head>',
          '<body></body>',
          '</html>'
      ].join('');

      assert.equal(html, jade.render(str));
      assert.equal('<foo></foo>something<bar></bar>', jade.render('foo\n= "something"\nbar'));
      assert.equal('<foo></foo>something<bar></bar>else', jade.render('foo\n= "something"\nbar\n= "else"'));
    });

    it('should support text', function(){
      assert.equal('foo\nbar\nbaz', jade.render('| foo\n| bar\n| baz'));
      assert.equal('foo \nbar \nbaz', jade.render('| foo \n| bar \n| baz'));
      assert.equal('(hey)', jade.render('| (hey)'));
      assert.equal('some random text', jade.render('| some random text'));
      assert.equal('  foo', jade.render('|   foo'));
      assert.equal('  foo  ', jade.render('|   foo  '));
      assert.equal('  foo  \n bar    ', jade.render('|   foo  \n|  bar    '));
    });

    it('should support pipe-less text', function(){
      assert.equal('<pre><code><foo></foo><bar></bar></code></pre>', jade.render('pre\n  code\n    foo\n\n    bar'));
      assert.equal('<p>foo\n\nbar</p>', jade.render('p.\n  foo\n\n  bar'));
      assert.equal('<p>foo\n\n\n\nbar</p>', jade.render('p.\n  foo\n\n\n\n  bar'));
      assert.equal('<p>foo\n  bar\nfoo</p>', jade.render('p.\n  foo\n    bar\n  foo'));
      assert.equal('<script>s.parentNode.insertBefore(g,s)</script>', jade.render('script.\n  s.parentNode.insertBefore(g,s)\n'));
      assert.equal('<script>s.parentNode.insertBefore(g,s)</script>', jade.render('script.\n  s.parentNode.insertBefore(g,s)'));
    });

    it('should support tag text', function(){
      assert.equal('<p>some random text</p>', jade.render('p some random text'));
      assert.equal('<p>click<a>Google</a>.</p>', jade.render('p\n  | click\n  a Google\n  | .'));
      assert.equal('<p>(parens)</p>', jade.render('p (parens)'));
      assert.equal('<p foo="bar">(parens)</p>', jade.render('p(foo="bar") (parens)'));
      assert.equal('<option value="">-- (optional) foo --</option>', jade.render('option(value="") -- (optional) foo --'));
    });

    it('should support tag text block', function(){
      assert.equal('<p>foo \nbar \nbaz</p>', jade.render('p\n  | foo \n  | bar \n  | baz'));
      assert.equal('<label>Password:<input/></label>', jade.render('label\n  | Password:\n  input'));
      assert.equal('<label>Password:<input/></label>', jade.render('label Password:\n  input'));
    });

    it('should support tag text interpolation', function(){
      assert.equal('yo, jade is cool', jade.render('| yo, #{name} is cool\n', { name: 'jade' }));
      assert.equal('<p>yo, jade is cool</p>', jade.render('p yo, #{name} is cool', { name: 'jade' }));
      assert.equal('yo, jade is cool', jade.render('| yo, #{name || "jade"} is cool', { name: null }));
      assert.equal('yo, \'jade\' is cool', jade.render('| yo, #{name || "\'jade\'"} is cool', { name: null }));
      assert.equal('foo &lt;script&gt; bar', jade.render('| foo #{code} bar', { code: '<script>' }));
      assert.equal('foo <script> bar', jade.render('| foo !{code} bar', { code: '<script>' }));
    });

    it('should support flexible indentation', function(){
      assert.equal('<html><body><h1>Wahoo</h1><p>test</p></body></html>', jade.render('html\n  body\n   h1 Wahoo\n   p test'));
    });

    it('should support interpolation values', function(){
      assert.equal('<p>Users: 15</p>', jade.render('p Users: #{15}'));
      assert.equal('<p>Users: </p>', jade.render('p Users: #{null}'));
      assert.equal('<p>Users: </p>', jade.render('p Users: #{undefined}'));
      assert.equal('<p>Users: none</p>', jade.render('p Users: #{undefined || "none"}'));
      assert.equal('<p>Users: 0</p>', jade.render('p Users: #{0}'));
      assert.equal('<p>Users: false</p>', jade.render('p Users: #{false}'));
    });

    it('should support test html 5 mode', function(){
      assert.equal('<!DOCTYPE html><input type="checkbox" checked>', jade.render('doctype html\ninput(type="checkbox", checked)'));
      assert.equal('<!DOCTYPE html><input type="checkbox" checked>', jade.render('doctype html\ninput(type="checkbox", checked=true)'));
      assert.equal('<!DOCTYPE html><input type="checkbox">', jade.render('doctype html\ninput(type="checkbox", checked= false)'));
    });

    it('should support multi-line attrs', function(){
      assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', jade.render('a(foo="bar"\n  bar="baz"\n  checked) foo'));
      assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', jade.render('a(foo="bar"\nbar="baz"\nchecked) foo'));
      assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', jade.render('a(foo="bar"\n,bar="baz"\n,checked) foo'));
      assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', jade.render('a(foo="bar",\nbar="baz",\nchecked) foo'));
    });

    it('should support attrs', function(){
      assert.equal('<img src="&lt;script&gt;"/>', jade.render('img(src="<script>")'), 'Test attr escaping');

      assert.equal('<a data-attr="bar"></a>', jade.render('a(data-attr="bar")'));
      assert.equal('<a data-attr="bar" data-attr-2="baz"></a>', jade.render('a(data-attr="bar", data-attr-2="baz")'));

      assert.equal('<a title="foo,bar"></a>', jade.render('a(title= "foo,bar")'));
      assert.equal('<a title="foo,bar" href="#"></a>', jade.render('a(title= "foo,bar", href="#")'));

      assert.equal('<p class="foo"></p>', jade.render("p(class='foo')"), 'Test single quoted attrs');
      assert.equal('<input type="checkbox" checked="checked"/>', jade.render('input( type="checkbox", checked )'));
      assert.equal('<input type="checkbox" checked="checked"/>', jade.render('input( type="checkbox", checked = true )'));
      assert.equal('<input type="checkbox"/>', jade.render('input(type="checkbox", checked= false)'));
      assert.equal('<input type="checkbox"/>', jade.render('input(type="checkbox", checked= null)'));
      assert.equal('<input type="checkbox"/>', jade.render('input(type="checkbox", checked= undefined)'));

      assert.equal('<img src="/foo.png"/>', jade.render('img(src="/foo.png")'), 'Test attr =');
      assert.equal('<img src="/foo.png"/>', jade.render('img(src  =  "/foo.png")'), 'Test attr = whitespace');
      assert.equal('<img src="/foo.png"/>', jade.render('img(src="/foo.png")'), 'Test attr :');
      assert.equal('<img src="/foo.png"/>', jade.render('img(src  =  "/foo.png")'), 'Test attr : whitespace');

      assert.equal('<img src="/foo.png" alt="just some foo"/>', jade.render('img(src="/foo.png", alt="just some foo")'));
      assert.equal('<img src="/foo.png" alt="just some foo"/>', jade.render('img(src = "/foo.png", alt = "just some foo")'));

      assert.equal('<p class="foo,bar,baz"></p>', jade.render('p(class="foo,bar,baz")'));
      assert.equal('<a href="http://google.com" title="Some : weird = title"></a>', jade.render('a(href= "http://google.com", title= "Some : weird = title")'));
      assert.equal('<label for="name"></label>', jade.render('label(for="name")'));
      assert.equal('<meta name="viewport" content="width=device-width"/>', jade.render("meta(name= 'viewport', content='width=device-width')"), 'Test attrs that contain attr separators');
      assert.equal('<div style="color= white"></div>', jade.render("div(style='color= white')"));
      assert.equal('<div style="color: white"></div>', jade.render("div(style='color: white')"));
      assert.equal('<p class="foo"></p>', jade.render("p('class'='foo')"), 'Test keys with single quotes');
      assert.equal('<p class="foo"></p>', jade.render("p(\"class\"= 'foo')"), 'Test keys with double quotes');

      assert.equal('<p data-lang="en"></p>', jade.render('p(data-lang = "en")'));
      assert.equal('<p data-dynamic="true"></p>', jade.render('p("data-dynamic"= "true")'));
      assert.equal('<p data-dynamic="true" class="name"></p>', jade.render('p("class"= "name", "data-dynamic"= "true")'));
      assert.equal('<p data-dynamic="true"></p>', jade.render('p(\'data-dynamic\'= "true")'));
      assert.equal('<p data-dynamic="true" class="name"></p>', jade.render('p(\'class\'= "name", \'data-dynamic\'= "true")'));
      assert.equal('<p data-dynamic="true" yay="yay" class="name"></p>', jade.render('p(\'class\'= "name", \'data-dynamic\'= "true", yay)'));

      assert.equal('<input checked="checked" type="checkbox"/>', jade.render('input(checked, type="checkbox")'));

      assert.equal('<a data-foo="{ foo: \'bar\', bar= \'baz\' }"></a>', jade.render('a(data-foo  = "{ foo: \'bar\', bar= \'baz\' }")'));

      assert.equal('<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>', jade.render('meta(http-equiv="X-UA-Compatible", content="IE=edge,chrome=1")'));

      assert.equal('<div style="background: url(/images/test.png)">Foo</div>', jade.render("div(style= 'background: url(/images/test.png)') Foo"));
      assert.equal('<div style="background = url(/images/test.png)">Foo</div>', jade.render("div(style= 'background = url(/images/test.png)') Foo"));
      assert.equal('<div style="foo">Foo</div>', jade.render("div(style= ['foo', 'bar'][0]) Foo"));
      assert.equal('<div style="bar">Foo</div>', jade.render("div(style= { foo: 'bar', baz: 'raz' }['foo']) Foo"));
      assert.equal('<a href="def">Foo</a>', jade.render("a(href='abcdefg'.substr(3,3)) Foo"));
      assert.equal('<a href="def">Foo</a>', jade.render("a(href={test: 'abcdefg'}.test.substr(3,3)) Foo"));
      assert.equal('<a href="def">Foo</a>', jade.render("a(href={test: 'abcdefg'}.test.substr(3,[0,3][1])) Foo"));

      assert.equal('<rss xmlns:atom="atom"></rss>', jade.render("rss(xmlns:atom=\"atom\")"));
      assert.equal('<rss xmlns:atom="atom"></rss>', jade.render("rss('xmlns:atom'=\"atom\")"));
      assert.equal('<rss xmlns:atom="atom"></rss>', jade.render("rss(\"xmlns:atom\"='atom')"));
      assert.equal('<rss xmlns:atom="atom" foo="bar"></rss>', jade.render("rss('xmlns:atom'=\"atom\", 'foo'= 'bar')"));
      assert.equal('<a data-obj="{ foo: \'bar\' }"></a>', jade.render("a(data-obj= \"{ foo: 'bar' }\")"));

      assert.equal('<meta content="what\'s up? \'weee\'"/>', jade.render('meta(content="what\'s up? \'weee\'")'));
    });

    it('should support class attr array', function(){
      assert.equal('<body class="foo bar baz"></body>', jade.render('body(class=["foo", "bar", "baz"])'));
    });

    it('should support attr interpolation', function(){
      // Test single quote interpolation
      assert.equal('<a href="/user/12">tj</a>'
        , jade.render("a(href='/user/#{id}') #{name}", { name: 'tj', id: 12 }));

      assert.equal('<a href="/user/12-tj">tj</a>'
        , jade.render("a(href='/user/#{id}-#{name}') #{name}", { name: 'tj', id: 12 }));

      assert.equal('<a href="/user/&lt;script&gt;">tj</a>'
        , jade.render("a(href='/user/#{id}') #{name}", { name: 'tj', id: '<script>' }));

      // Test double quote interpolation
      assert.equal('<a href="/user/13">ds</a>'
        , jade.render('a(href="/user/#{id}") #{name}', { name: 'ds', id: 13 }));

      assert.equal('<a href="/user/13-ds">ds</a>'
        , jade.render('a(href="/user/#{id}-#{name}") #{name}', { name: 'ds', id: 13 }));

      assert.equal('<a href="/user/&lt;script&gt;">ds</a>'
        , jade.render('a(href="/user/#{id}") #{name}', { name: 'ds', id: '<script>' }));

      // Test escaping the interpolation
      assert.equal('<a href="/user/#{id}">#{name}</a>'
        , jade.render('a(href="/user/\\#{id}") \\#{name}', {}));
      assert.equal('<a href="/user/#{id}">ds</a>'
        , jade.render('a(href="/user/\\#{id}") #{name}', {name: 'ds'}));
    });

    it('should support attr parens', function(){
      assert.equal('<p foo="bar">baz</p>', jade.render('p(foo=((("bar"))))= ((("baz")))'));
    });

    it('should support code attrs', function(){
      assert.equal('<p></p>', jade.render('p(id= name)', { name: undefined }));
      assert.equal('<p></p>', jade.render('p(id= name)', { name: null }));
      assert.equal('<p></p>', jade.render('p(id= name)', { name: false }));
      assert.equal('<p id=""></p>', jade.render('p(id= name)', { name: '' }));
      assert.equal('<p id="tj"></p>', jade.render('p(id= name)', { name: 'tj' }));
      assert.equal('<p id="default"></p>', jade.render('p(id= name || "default")', { name: null }));
      assert.equal('<p id="something"></p>', jade.render("p(id= 'something')", { name: null }));
      assert.equal('<p id="something"></p>', jade.render("p(id = 'something')", { name: null }));
      assert.equal('<p id="foo"></p>', jade.render("p(id= (true ? 'foo' : 'bar'))"));
      assert.equal('<option value="">Foo</option>', jade.render("option(value='') Foo"));
    });

    it('should support code attrs class', function(){
      assert.equal('<p class="tj"></p>', jade.render('p(class= name)', { name: 'tj' }));
      assert.equal('<p class="tj"></p>', jade.render('p( class= name )', { name: 'tj' }));
      assert.equal('<p class="default"></p>', jade.render('p(class= name || "default")', { name: null }));
      assert.equal('<p class="foo default"></p>', jade.render('p.foo(class= name || "default")', { name: null }));
      assert.equal('<p class="default foo"></p>', jade.render('p(class= name || "default").foo', { name: null }));
      assert.equal('<p id="default"></p>', jade.render('p(id = name || "default")', { name: null }));
      assert.equal('<p id="user-1"></p>', jade.render('p(id = "user-" + 1)'));
      assert.equal('<p class="user-1"></p>', jade.render('p(class = "user-" + 1)'));
    });

    it('should support code buffering', function(){
      assert.equal('<p></p>', jade.render('p= null'));
      assert.equal('<p></p>', jade.render('p= undefined'));
      assert.equal('<p>0</p>', jade.render('p= 0'));
      assert.equal('<p>false</p>', jade.render('p= false'));
    });

    it('should support script text', function(){
      var str = [
        'script.',
        '  p foo',
        '',
        'script(type="text/template")',
        '  p foo',
        '',
        'script(type="text/template").',
        '  p foo'
      ].join('\n');

      var html = [
        '<script>p foo\n</script>',
        '<script type="text/template"><p>foo</p></script>',
        '<script type="text/template">p foo</script>'
      ].join('');

      assert.equal(html, jade.render(str));
    });

    it('should support comments', function(){
      // Regular
      var str = [
          '//foo',
          'p bar'
      ].join('\n');

      var html = [
          '<!--foo-->',
          '<p>bar</p>'
      ].join('');

      assert.equal(html, jade.render(str));

      // Between tags

      var str = [
          'p foo',
          '// bar ',
          'p baz'
      ].join('\n');

      var html = [
          '<p>foo</p>',
          '<!-- bar -->',
          '<p>baz</p>'
      ].join('');

      assert.equal(html, jade.render(str));

      // Quotes

      var str = "<!-- script(src: '/js/validate.js') -->",
          js = "// script(src: '/js/validate.js') ";
      assert.equal(str, jade.render(js));
    });

    it('should support unbuffered comments', function(){
      var str = [
          '//- foo',
          'p bar'
      ].join('\n');

      var html = [
          '<p>bar</p>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          'p foo',
          '//- bar ',
          'p baz'
      ].join('\n');

      var html = [
          '<p>foo</p>',
          '<p>baz</p>'
      ].join('');

      assert.equal(html, jade.render(str));
    });

    it('should support literal html', function(){
      assert.equal('<!--[if IE lt 9]>weeee<![endif]-->', jade.render('<!--[if IE lt 9]>weeee<![endif]-->'));
    });

    it('should support code', function(){
      assert.equal('test', jade.render('!= "test"'));
      assert.equal('test', jade.render('= "test"'));
      assert.equal('test', jade.render('- var foo = "test"\n=foo'));
      assert.equal('foo<em>test</em>bar', jade.render('- var foo = "test"\n| foo\nem= foo\n| bar'));
      assert.equal('test<h2>something</h2>', jade.render('!= "test"\nh2 something'));

      var str = [
          '- var foo = "<script>";',
          '= foo',
          '!= foo'
      ].join('\n');

      var html = [
          '&lt;script&gt;',
          '<script>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          '- var foo = "<script>";',
          '- if (foo)',
          '  p= foo'
      ].join('\n');

      var html = [
          '<p>&lt;script&gt;</p>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          '- var foo = "<script>";',
          '- if (foo)',
          '  p!= foo'
      ].join('\n');

      var html = [
          '<p><script></p>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          '- var foo;',
          '- if (foo)',
          '  p.hasFoo= foo',
          '- else',
          '  p.noFoo no foo'
      ].join('\n');

      var html = [
          '<p class="noFoo">no foo</p>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          '- var foo;',
          '- if (foo)',
          '  p.hasFoo= foo',
          '- else if (true)',
          '  p kinda foo',
          '- else',
          '  p.noFoo no foo'
      ].join('\n');

      var html = [
          '<p>kinda foo</p>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          'p foo',
          '= "bar"',
      ].join('\n');

      var html = [
          '<p>foo</p>bar'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          'title foo',
          '- if (true)',
          '  p something',
      ].join('\n');

      var html = [
          '<title>foo</title><p>something</p>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          'foo',
          '  bar= "bar"',
          '    baz= "baz"',
      ].join('\n');

      var html = [
          '<foo>',
          '<bar>bar',
          '<baz>baz</baz>',
          '</bar>',
          '</foo>'
      ].join('');

      assert.equal(html, jade.render(str));
    });

    it('should support - each', function(){
      // Array
      var str = [
          '- var items = ["one", "two", "three"];',
          '- each item in items',
          '  li= item'
      ].join('\n');

      var html = [
          '<li>one</li>',
          '<li>two</li>',
          '<li>three</li>'
      ].join('');

      assert.equal(html, jade.render(str));

      // Any enumerable (length property)
      var str = [
          '- var jQuery = { length: 3, 0: 1, 1: 2, 2: 3 };',
          '- each item in jQuery',
          '  li= item'
      ].join('\n');

      var html = [
          '<li>1</li>',
          '<li>2</li>',
          '<li>3</li>'
      ].join('');

      assert.equal(html, jade.render(str));

      // Empty array
      var str = [
          '- var items = [];',
          '- each item in items',
          '  li= item'
      ].join('\n');

      assert.equal('', jade.render(str));

      // Object
      var str = [
          '- var obj = { foo: "bar", baz: "raz" };',
          '- each val in obj',
          '  li= val'
      ].join('\n');

      var html = [
          '<li>bar</li>',
          '<li>raz</li>'
      ].join('');

      assert.equal(html, jade.render(str));

      // Complex
      var str = [
          '- var obj = { foo: "bar", baz: "raz" };',
          '- each key in Object.keys(obj)',
          '  li= key'
      ].join('\n');

      var html = [
          '<li>foo</li>',
          '<li>baz</li>'
      ].join('');

      assert.equal(html, jade.render(str));

      // Keys
      var str = [
          '- var obj = { foo: "bar", baz: "raz" };',
          '- each val, key in obj',
          '  li #{key}: #{val}'
      ].join('\n');

      var html = [
          '<li>foo: bar</li>',
          '<li>baz: raz</li>'
      ].join('');

      assert.equal(html, jade.render(str));

      // Nested
      var str = [
          '- var users = [{ name: "tj" }]',
          '- each user in users',
          '  - each val, key in user',
          '    li #{key} #{val}',
      ].join('\n');

      var html = [
          '<li>name tj</li>'
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          '- var users = ["tobi", "loki", "jane"]',
          'each user in users',
          '  li= user',
      ].join('\n');

      var html = [
          '<li>tobi</li>',
          '<li>loki</li>',
          '<li>jane</li>',
      ].join('');

      assert.equal(html, jade.render(str));

      var str = [
          '- var users = ["tobi", "loki", "jane"]',
          'for user in users',
          '  li= user',
      ].join('\n');

      var html = [
          '<li>tobi</li>',
          '<li>loki</li>',
          '<li>jane</li>',
      ].join('');

      assert.equal(html, jade.render(str));
    });

    it('should support if', function(){
      var str = [
          '- var users = ["tobi", "loki", "jane"]',
          'if users.length',
          '  p users: #{users.length}',
      ].join('\n');

      assert.equal('<p>users: 3</p>', jade.render(str));

      assert.equal('<iframe foo="bar"></iframe>', jade.render('iframe(foo="bar")'));
    });

    it('should support unless', function(){
      var str = [
          '- var users = ["tobi", "loki", "jane"]',
          'unless users.length',
          '  p no users',
      ].join('\n');

      assert.equal('', jade.render(str));

      var str = [
          '- var users = []',
          'unless users.length',
          '  p no users',
      ].join('\n');

      assert.equal('<p>no users</p>', jade.render(str));
    });

    it('should support else', function(){
      var str = [
          '- var users = []',
          'if users.length',
          '  p users: #{users.length}',
          'else',
          '  p users: none',
      ].join('\n');

      assert.equal('<p>users: none</p>', jade.render(str));
    });

    it('should else if', function(){
      var str = [
          '- var users = ["tobi", "jane", "loki"]',
          'for user in users',
          '  if user == "tobi"',
          '    p awesome #{user}',
          '  else if user == "jane"',
          '    p lame #{user}',
          '  else',
          '    p #{user}',
      ].join('\n');

      assert.equal('<p>awesome tobi</p><p>lame jane</p><p>loki</p>', jade.render(str));
    });

    it('should include block', function(){
      var str = [
          'html',
          '  head',
          '    include fixtures/scripts',
          '      scripts(src="/app.js")',
      ].join('\n');

      assert.equal('<html><head><script src=\"/jquery.js\"></script><script src=\"/caustic.js\"></script><scripts src=\"/app.js\"></scripts></head></html>'
      , jade.render(str, { filename: __dirname + '/jade.test.js' }));
    });

    it('should not fail on js newlines', function(){
      assert.equal("<p>foo\u2028bar</p>", jade.render("p foo\u2028bar"));
      assert.equal("<p>foo\u2029bar</p>", jade.render("p foo\u2029bar"));
    });
  });

  describe('.compileFile()', function () {
    it('does not produce warnings for issue-1593', function () {
      jade.compileFile(__dirname + '/fixtures/issue-1593/index.jade');
    });
    it('should support caching (pass 1)', function () {
      fs.writeFileSync(__dirname + '/temp/input-compileFile.jade', '.foo bar');
      var fn = jade.compileFile(__dirname + '/temp/input-compileFile.jade',
                                { cache: true });
      var expected = '<div class="foo">bar</div>';
      assert(fn() === expected);
    });
    it('should support caching (pass 2)', function () {
      // Poison the input file
      fs.writeFileSync(__dirname + '/temp/input-compileFile.jade', '.big fat hen');
      var fn = jade.compileFile(__dirname + '/temp/input-compileFile.jade',
                                { cache: true });
      var expected = '<div class="foo">bar</div>';
      assert(fn() === expected);
    });
  });

  describe('.render()', function () {
    it('should support .jade.render(str, fn)', function(){
      jade.render('p foo bar', function(err, str){
        assert.ok(!err);
        assert.equal('<p>foo bar</p>', str);
      });
    });

    it('should support .jade.render(str, options, fn)', function(){
      jade.render('p #{foo}', { foo: 'bar' }, function(err, str){
        assert.ok(!err);
        assert.equal('<p>bar</p>', str);
      });
    });

    it('should support .jade.render(str, options, fn) cache', function(){
      jade.render('p bar', { cache: true }, function(err, str){
        assert.ok(/the "filename" option is required for caching/.test(err.message));
      });

      jade.render('p foo bar', { cache: true, filename: 'test' }, function(err, str){
        assert.ok(!err);
        assert.equal('<p>foo bar</p>', str);
      });
    });
  })

  describe('.compile()', function(){
    it('should support .compile()', function(){
      var fn = jade.compile('p foo');
      assert.equal('<p>foo</p>', fn());
    });

    it('should support .compile() locals', function(){
      var fn = jade.compile('p= foo');
      assert.equal('<p>bar</p>', fn({ foo: 'bar' }));
    });

    it('should support .compile() locals in \'self\' hash', function(){
      var fn = jade.compile('p= self.foo', {self: true});
      assert.equal('<p>bar</p>', fn({ foo: 'bar' }));
    });

    it('should support .compile() no debug', function(){
      var fn = jade.compile('p foo\np #{bar}', {compileDebug: false});
      assert.equal('<p>foo</p><p>baz</p>', fn({bar: 'baz'}));
    });

    it('should support .compile() no debug and global helpers', function(){
      var fn = jade.compile('p foo\np #{bar}', {compileDebug: false, helpers: 'global'});
      assert.equal('<p>foo</p><p>baz</p>', fn({bar: 'baz'}));
    });

    it('should be reasonably fast', function(){
      jade.compile(perfTest, {})
    });
    it('allows trailing space (see #1586)', function () {
      var res = jade.render('ul \n  li An Item');
      assert.equal('<ul> <li>An Item</li></ul>', res);
    });
  });

  describe('.compileClient()', function () {
    it('should support .jade.compileClient(str)', function () {
      var src = fs.readFileSync(__dirname + '/cases/basic.jade');
      var expected = fs.readFileSync(__dirname + '/cases/basic.html', 'utf8').replace(/\s/g, '');
      var fn = jade.compileClient(src);
      fn = Function('jade', fn.toString() + '\nreturn template;')(jade.runtime);
      var actual = fn({name: 'foo'}).replace(/\s/g, '');
      assert(actual === expected);
    });
    it('should support .jade.compileClient(str, options)', function () {
      var src = '.bar= self.foo'
      var fn = jade.compileClient(src, {self: true});
      fn = Function('jade', fn.toString() + '\nreturn template;')(jade.runtime);
      var actual = fn({foo: 'baz'});
      assert(actual === '<div class="bar">baz</div>');
    });
  });

  describe('.renderFile()', function () {
    it('will synchronously return a string', function () {
      var expected = fs.readFileSync(__dirname + '/cases/basic.html', 'utf8').replace(/\s/g, '');
      var actual = jade.renderFile(__dirname + '/cases/basic.jade', {name: 'foo'}).replace(/\s/g, '');
      assert(actual === expected);
    });
    it('when given a callback, it calls that rather than returning', function (done) {
      var expected = fs.readFileSync(__dirname + '/cases/basic.html', 'utf8').replace(/\s/g, '');
      jade.renderFile(__dirname + '/cases/basic.jade', {name: 'foo'}, function (err, actual) {
        if (err) return done(err);
        assert(actual.replace(/\s/g, '') === expected);
        done();
      });
    });
    it('when given a callback, it calls that rather than returning even if there are no options', function (done) {
      var expected = fs.readFileSync(__dirname + '/cases/basic.html', 'utf8').replace(/\s/g, '');
      jade.renderFile(__dirname + '/cases/basic.jade', function (err, actual) {
        if (err) return done(err);
        assert(actual.replace(/\s/g, '') === expected);
        done();
      });
    });
    it('when given a callback, it calls that with any errors', function (done) {
      jade.renderFile(__dirname + '/fixtures/runtime.error.jade', function (err, actual) {
        assert.ok(err);
        done();
      });
    });
    it('should support caching (pass 1)', function (done) {
      fs.writeFileSync(__dirname + '/temp/input-renderFile.jade', '.foo bar');
      jade.renderFile(__dirname + '/temp/input-renderFile.jade', { cache: true }, function (err, actual) {
        if (err) return done(err);
        assert.equal('<div class="foo">bar</div>', actual);
        done();
      });
    });
    it('should support caching (pass 2)', function (done) {
      // Poison the input file
      fs.writeFileSync(__dirname + '/temp/input-renderFile.jade', '.big fat hen');
      jade.renderFile(__dirname + '/temp/input-renderFile.jade', { cache: true }, function (err, actual) {
        if (err) return done(err);
        assert.equal('<div class="foo">bar</div>', actual);
        done();
      });
    });
  });

  describe('.compileFileClient(path, options)', function () {
    it('returns a string form of a function called `template`', function () {
      var src = jade.compileFileClient(__dirname + '/cases/basic.jade');
      var expected = fs.readFileSync(__dirname + '/cases/basic.html', 'utf8').replace(/\s/g, '');
      var fn = Function('jade', src + '\nreturn template;')(jade.runtime);
      var actual = fn({name: 'foo'}).replace(/\s/g, '');
      assert(actual === expected);
    });
    it('accepts the `name` option to rename the resulting function', function () {
      var src = jade.compileFileClient(__dirname + '/cases/basic.jade', {name: 'myTemplateName'});
      var expected = fs.readFileSync(__dirname + '/cases/basic.html', 'utf8').replace(/\s/g, '');
      var fn = Function('jade', src + '\nreturn myTemplateName;')(jade.runtime);
      var actual = fn({name: 'foo'}).replace(/\s/g, '');
      assert(actual === expected);
    });
    it('should support caching (pass 1)', function () {
      fs.writeFileSync(__dirname + '/temp/input-compileFileClient.jade', '.foo bar');
      var src = jade.compileFileClient(__dirname + '/temp/input-compileFileClient.jade',
                                        { name: 'myTemplateName',
                                          cache: true });
      var expected = '<div class="foo">bar</div>';
      var fn = Function('jade', src + '\nreturn myTemplateName;')(jade.runtime);
      assert(fn() === expected);
    });
    it('should support caching (pass 2)', function () {
      // Poison the input file
      fs.writeFileSync(__dirname + '/temp/input-compileFileClient.jade', '.big fat hen');
      var src = jade.compileFileClient(__dirname + '/temp/input-compileFileClient.jade',
                                        { name: 'myTemplateName',
                                          cache: true });
      var expected = '<div class="foo">bar</div>';
      var fn = Function('jade', src + '\nreturn myTemplateName;')(jade.runtime);
      assert(fn() === expected);
    });
  });

  describe('.runtime', function () {
    describe('.merge', function () {
      it('merges two attribute objects, giving precedensce to the second object', function () {
        assert.deepEqual(jade.runtime.merge({}, {'class': ['foo', 'bar'], 'foo': 'bar'}), {'class': ['foo', 'bar'], 'foo': 'bar'});
        assert.deepEqual(jade.runtime.merge({'class': ['foo'], 'foo': 'baz'}, {'class': ['bar'], 'foo': 'bar'}), {'class': ['foo', 'bar'], 'foo': 'bar'});
        assert.deepEqual(jade.runtime.merge({'class': ['foo', 'bar'], 'foo': 'bar'}, {}), {'class': ['foo', 'bar'], 'foo': 'bar'});
      });
    });
    describe('.attrs', function () {
      it('Renders the given attributes object', function () {
        assert.equal(jade.runtime.attrs({}), '');
        assert.equal(jade.runtime.attrs({'class': []}), '');
        assert.equal(jade.runtime.attrs({'class': ['foo']}), ' class="foo"');
        assert.equal(jade.runtime.attrs({'class': ['foo'], 'id': 'bar'}), ' class="foo" id="bar"');
      });
    });
  });

  describe('filter indentation', function () {
    it('is maintained', function () {
      jade.filters.indents = function(str){
        return str.split(/\n/).map(function (line) { return line.match(/^ */)[0].length; }).join(",");
      };

      var indents = [
        ':indents',
        '  x',
        '   x',
        '    x',
        '     x',
        '  x',
        '      x',
        '      x',
        '     x',
        '     x',
        '      x',
        '    x',
        '  x',
        '    x',
        '  x',
        '   x'
      ].join('\n');

      assert.equal(jade.render(indents), '0,1,2,3,0,4,4,3,3,4,2,0,2,0,1');
    });
  });

  describe('.compile().dependencies', function() {
    it('should list the filename of the template referenced by extends', function(){
      var filename = __dirname + '/dependencies/extends1.jade';
      var str = fs.readFileSync(filename, 'utf8');
      var info = jade.compile(str, {filename: filename});
      assert.deepEqual([
        path.resolve(__dirname + '/dependencies/dependency1.jade')
      ], info.dependencies);
    });
    it('should list the filename of the template referenced by an include', function() {
      var filename = __dirname + '/dependencies/include1.jade';
      var str = fs.readFileSync(filename, 'utf8');
      var info = jade.compile(str, {filename: filename});
      assert.deepEqual([
        path.resolve(__dirname + '/dependencies/dependency1.jade')
      ], info.dependencies);
    });
    it('should list the dependencies of extends dependencies', function() {
      var filename = __dirname + '/dependencies/extends2.jade';
      var str = fs.readFileSync(filename, 'utf8');
      var info = jade.compile(str, {filename: filename});
      assert.deepEqual([
        path.resolve(__dirname + '/dependencies/dependency2.jade'),
        path.resolve(__dirname + '/dependencies/dependency3.jade')
      ], info.dependencies);
    });
    it('should list the dependencies of include dependencies', function() {
      var filename = __dirname + '/dependencies/include2.jade';
      var str = fs.readFileSync(filename, 'utf8');
      var info = jade.compile(str, {filename: filename});
      assert.deepEqual([
        path.resolve(__dirname + '/dependencies/dependency2.jade'),
        path.resolve(__dirname + '/dependencies/dependency3.jade')
      ],info.dependencies);
    });
  });
});
