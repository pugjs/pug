
/**
 * Module dependencies.
 */

var jade = require('../')
  , ENOENT;

// COMPAT:

try {
  ENOENT = require('constants').ENOENT;
} catch (err) {
  ENOENT = process.ENOENT;
}

// Shortcut

var render = jade.render;

module.exports = {
    'test .version': function(assert){
        assert.ok(/^\d+\.\d+\.\d+$/.test(jade.version), "Invalid version format");
    },
    
    'test exports': function(assert){
        assert.equal('object', typeof jade.selfClosing, 'exports.selfClosing missing');
        assert.equal('object', typeof jade.doctypes, 'exports.doctypes missing');
        assert.equal('object', typeof jade.filters, 'exports.filters missing');
        assert.equal('object', typeof jade.utils, 'exports.utils missing');
        assert.equal('function', typeof jade.Compiler, 'exports.Compiler missing');
    },
    
    'test doctypes': function(assert){
        assert.equal('<?xml version="1.0" encoding="utf-8" ?>', render('!!! xml'));
        assert.equal('<!DOCTYPE html>', render('doctype html'));
        assert.equal('<!DOCTYPE html>', render('doctype HTML'));
        assert.equal('<!DOCTYPE html>', render('!!! 5'));
        assert.equal('<!DOCTYPE html>', render('!!!', { doctype:'html' }));
        assert.equal('<!DOCTYPE html>', render('!!! html', { doctype:'xml' }));
        assert.equal('<html></html>', render('html'));
        assert.equal('<!DOCTYPE html><html></html>', render('html', { doctype:'html' }));
    },
    
    'test Buffers': function(assert){
        assert.equal('<p>foo</p>', render(new Buffer('p foo')));
    },
    
    'test line endings': function(assert){
        var str = [
            'p',
            'div',
            'img'
        ].join('\r\n');

        var html = [
            '<p></p>',
            '<div></div>',
            '<img/>'
        ].join('');

        assert.equal(html, render(str));
        
        var str = [
            'p',
            'div',
            'img'
        ].join('\r');

        var html = [
            '<p></p>',
            '<div></div>',
            '<img/>'
        ].join('');

        assert.equal(html, render(str));
        
        var str = [
            'p',
            'div',
            'img'
        ].join('\r\n');

        var html = [
            '<p></p>',
            '<div></div>',
            '<img>'
        ].join('');

        assert.equal(html, render(str, { doctype:'html' }));
    },
    
    'test single quotes': function(assert){
        assert.equal("<p>'foo'</p>", render("p 'foo'"));
        assert.equal("<p>'foo'\n</p>", render("p\n  | 'foo'"));
        assert.equal('<a href="/foo"></a>', render("- var path = 'foo';\na(href='/' + path)"));
    },

    'test block-expansion': function(assert){
        assert.equal("<li><a>foo</a></li><li><a>bar</a></li><li><a>baz</a></li>", render("li: a foo\nli: a bar\nli: a baz"));
        assert.equal("<li class=\"first\"><a>foo</a></li><li><a>bar</a></li><li><a>baz</a></li>", render("li.first: a foo\nli: a bar\nli: a baz"));
    },
    
    'test tags': function(assert){
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

        assert.equal(html, render(str), 'Test basic tags');
        assert.equal('<fb:foo-bar></fb:foo-bar>', render('fb:foo-bar'), 'Test hyphens');
        assert.equal('<div class="something"></div>', render('div.something'), 'Test classes');
        assert.equal('<div id="something"></div>', render('div#something'), 'Test ids');
        assert.equal('<div class="something"></div>', render('.something'), 'Test stand-alone classes');
        assert.equal('<div id="something"></div>', render('#something'), 'Test stand-alone ids');
        assert.equal('<div id="foo" class="bar"></div>', render('#foo.bar'));
        assert.equal('<div id="foo" class="bar"></div>', render('.bar#foo'));
        assert.equal('<div id="foo" class="bar"></div>', render('div#foo(class="bar")'));
        assert.equal('<div id="foo" class="bar"></div>', render('div(class="bar")#foo'));
        assert.equal('<div id="bar" class="foo"></div>', render('div(id="bar").foo'));
        assert.equal('<div class="foo bar baz"></div>', render('div.foo.bar.baz'));
        assert.equal('<div class="foo bar baz"></div>', render('div(class="foo").bar.baz'));
        assert.equal('<div class="foo bar baz"></div>', render('div.foo(class="bar").baz'));
        assert.equal('<div class="foo bar baz"></div>', render('div.foo.bar(class="baz")'));
        assert.equal('<div class="a-b2"></div>', render('div.a-b2'));
        assert.equal('<div class="a_b2"></div>', render('div.a_b2'));
        assert.equal('<fb:user></fb:user>', render('fb:user'));
        assert.equal('<fb:user:role></fb:user:role>', render('fb:user:role'));
        assert.equal('<colgroup><col class="test"/></colgroup>', render('colgroup\n  col.test'));
    },
    
    'test nested tags': function(assert){
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

        assert.equal(html, render(str));
        
        var str = [
            'a(href="#")',
            '  | foo ',
            '  | bar ',
            '  | baz'
        ].join('\n');
        
        assert.equal('<a href="#">foo \nbar \nbaz\n</a>', render(str));
        
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
            '<ul>two\n',
            '<li>three</li>',
            '</ul>',
            '</ul>'
        ].join('');
        
        assert.equal(html, render(str));
    },
    
    'test variable length newlines': function(assert){
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

        assert.equal(html, render(str));
    },
    
    'test tab conversion': function(assert){
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

        assert.equal(html, render(str));
    },
    
    'test newlines': function(assert){
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

        assert.equal(html, render(str));
        
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

        assert.equal(html, render(str));
        assert.equal('<foo></foo>something<bar></bar>', render('foo\n= "something"\nbar'));
        assert.equal('<foo></foo>something<bar></bar>else', render('foo\n= "something"\nbar\n= "else"'));
    },
    
    'test cache': function(assert){
        var err;
        try {
            render('foo', { cache: true });
        } catch (e) {
            err = e;
        }
        assert.equal('filename is required when using the cache option', err.message);
        
        assert.equal('<p></p>', render('p', { cache: true, filename: 'foo.jade' }));
        assert.equal('<p></p>', render('p', { cache: true, filename: 'foo.jade' }));
        assert.ok(typeof jade.cache['foo.jade'] === 'function', 'Test cache');
    },
    
    'test text': function(assert){
        assert.equal('foo\nbar\nbaz\n', render('| foo\n| bar\n| baz'));
        assert.equal('foo \nbar \nbaz\n', render('| foo \n| bar \n| baz'));
        assert.equal('(hey)\n', render('| (hey)'));
        assert.equal('some random text\n', render('| some random text'));
        assert.equal('  foo\n', render('|   foo'));
        assert.equal('  foo  \n', render('|   foo  '));
        assert.equal('  foo  \n bar    \n', render('|   foo  \n|  bar    '));
    },
    
    'test pipe-less text': function(assert){
      assert.equal('<pre><code>foo\n\nbar\n</code></pre>', render('pre\n  code\n    foo\n\n    bar'));
      assert.equal('<p>foo\n\nbar\n</p>', render('p.\n  foo\n\n  bar'));
      assert.equal('<p>foo\n\n\n\nbar\n</p>', render('p.\n  foo\n\n\n\n  bar'));
      assert.equal('<p>foo\n  bar\nfoo\n</p>', render('p.\n  foo\n    bar\n  foo'));
      assert.equal('<script>s.parentNode.insertBefore(g,s)\n</script>', render('script\n  s.parentNode.insertBefore(g,s)\n'));
      assert.equal('<script>s.parentNode.insertBefore(g,s)\n</script>', render('script\n  s.parentNode.insertBefore(g,s)'));
    },
    
    'test tag text': function(assert){
        assert.equal('<p>some random text</p>', render('p some random text'));
        assert.equal('<p>click\n<a>Google</a>.\n</p>', render('p\n  | click\n  a Google\n  | .'));
        assert.equal('<p>(parens)</p>', render('p (parens)'));
        assert.equal('<p foo="bar">(parens)</p>', render('p(foo="bar") (parens)'));
        assert.equal('<option value="">-- (optional) foo --</option>', render('option(value="") -- (optional) foo --'));
    },
    
    'test tag text block': function(assert){
        assert.equal('<p>foo \nbar \nbaz\n</p>', render('p\n  | foo \n  | bar \n  | baz'));
        assert.equal('<label>Password:\n<input/></label>', render('label\n  | Password:\n  input'));
        assert.equal('<label>Password:<input/></label>', render('label Password:\n  input'));
    },
    
    'test tag text interpolation': function(assert){
        assert.equal('yo, jade is cool\n', render('| yo, #{name} is cool\n', { locals: { name: 'jade' }}));
        assert.equal('<p>yo, jade is cool</p>', render('p yo, #{name} is cool', { locals: { name: 'jade' }}));
        assert.equal('yo, jade is cool\n', render('| yo, #{name || "jade"} is cool', { locals: { name: null }}));
        assert.equal('yo, \'jade\' is cool\n', render('| yo, #{name || "\'jade\'"} is cool', { locals: { name: null }}));
        assert.equal('foo &lt;script&gt; bar\n', render('| foo #{code} bar', { locals: { code: '<script>' }}));
        assert.equal('foo <script> bar\n', render('| foo !{code} bar', { locals: { code: '<script>' }}));
    },

    'test flexible indentation': function(assert){
        assert.equal('<html><body><h1>Wahoo</h1><p>test</p></body></html>', render('html\n  body\n   h1 Wahoo\n   p test'));
    },
    
    'test interpolation values': function(assert){
        assert.equal('<p>Users: 15</p>', render('p Users: #{15}'));
        assert.equal('<p>Users: </p>', render('p Users: #{null}'));
        assert.equal('<p>Users: </p>', render('p Users: #{undefined}'));
        assert.equal('<p>Users: none</p>', render('p Users: #{undefined || "none"}'));
        assert.equal('<p>Users: 0</p>', render('p Users: #{0}'));
        assert.equal('<p>Users: false</p>', render('p Users: #{false}'));
    },
    
    'test html 5 mode': function(assert){
        assert.equal('<!DOCTYPE html><input type="checkbox" checked>', render('!!! 5\ninput(type="checkbox", checked)'));
        assert.equal('<!DOCTYPE html><input type="checkbox" checked>', render('!!! 5\ninput(type="checkbox", checked=true)'));
        assert.equal('<!DOCTYPE html><input type="checkbox">', render('!!! 5\ninput(type="checkbox", checked= false)'));
    },
    
    'test multi-line attrs': function(assert){
        assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', render('a(foo="bar"\n  bar="baz"\n  checked) foo'));
        assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', render('a(foo="bar"\nbar="baz"\nchecked) foo'));
        assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', render('a(foo="bar"\n,bar="baz"\n,checked) foo'));
        assert.equal('<a foo="bar" bar="baz" checked="checked">foo</a>', render('a(foo="bar",\nbar="baz",\nchecked) foo'));
    },
    
    'test attrs': function(assert){
        assert.equal('<img src="&lt;script&gt;"/>', render('img(src="<script>")'), 'Test attr escaping');
        
        assert.equal('<a data-attr="bar"></a>', render('a(data-attr="bar")'));
        assert.equal('<a data-attr="bar" data-attr-2="baz"></a>', render('a(data-attr="bar", data-attr-2="baz")'));
        
        assert.equal('<a title="foo,bar"></a>', render('a(title= "foo,bar")'));
        assert.equal('<a title="foo,bar" href="#"></a>', render('a(title= "foo,bar", href="#")'));
        
        assert.equal('<p class="foo"></p>', render("p(class='foo')"), 'Test single quoted attrs');
        assert.equal('<input type="checkbox" checked="checked"/>', render('input( type="checkbox", checked )'));
        assert.equal('<input type="checkbox" checked="checked"/>', render('input( type="checkbox", checked = true )'));
        assert.equal('<input type="checkbox"/>', render('input(type="checkbox", checked= false)'));
        assert.equal('<input type="checkbox"/>', render('input(type="checkbox", checked= null)'));
        assert.equal('<input type="checkbox"/>', render('input(type="checkbox", checked= undefined)'));
        
        assert.equal('<img src="/foo.png"/>', render('img(src="/foo.png")'), 'Test attr =');
        assert.equal('<img src="/foo.png"/>', render('img(src  =  "/foo.png")'), 'Test attr = whitespace');
        assert.equal('<img src="/foo.png"/>', render('img(src="/foo.png")'), 'Test attr :');
        assert.equal('<img src="/foo.png"/>', render('img(src  =  "/foo.png")'), 'Test attr : whitespace');
        
        assert.equal('<img src="/foo.png" alt="just some foo"/>', render('img(src="/foo.png", alt="just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo"/>', render('img(src = "/foo.png", alt = "just some foo")'));
        
        assert.equal('<p class="foo,bar,baz"></p>', render('p(class="foo,bar,baz")'));
        assert.equal('<a href="http://google.com" title="Some : weird = title"></a>', render('a(href= "http://google.com", title= "Some : weird = title")'));
        assert.equal('<label for="name"></label>', render('label(for="name")'));
        assert.equal('<meta name="viewport" content="width=device-width"/>', render("meta(name= 'viewport', content='width=device-width')"), 'Test attrs that contain attr separators');
        assert.equal('<div style="color= white"></div>', render("div(style='color= white')"));
        assert.equal('<div style="color: white"></div>', render("div(style='color: white')"));
        assert.equal('<p class="foo"></p>', render("p('class'='foo')"), 'Test keys with single quotes');
        assert.equal('<p class="foo"></p>', render("p(\"class\"= 'foo')"), 'Test keys with double quotes');

        assert.equal('<p data-lang="en"></p>', render('p(data-lang = "en")'));
        assert.equal('<p data-dynamic="true"></p>', render('p("data-dynamic"= "true")'));
        assert.equal('<p data-dynamic="true" class="name"></p>', render('p("class"= "name", "data-dynamic"= "true")'));
        assert.equal('<p data-dynamic="true"></p>', render('p(\'data-dynamic\'= "true")'));
        assert.equal('<p data-dynamic="true" class="name"></p>', render('p(\'class\'= "name", \'data-dynamic\'= "true")'));
        assert.equal('<p data-dynamic="true" yay="yay" class="name"></p>', render('p(\'class\'= "name", \'data-dynamic\'= "true", yay)'));

        assert.equal('<input checked="checked" type="checkbox"/>', render('input(checked, type="checkbox")'));

        assert.equal('<a data-foo="{ foo: \'bar\', bar= \'baz\' }"></a>', render('a(data-foo  = "{ foo: \'bar\', bar= \'baz\' }")'));

        assert.equal('<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>', render('meta(http-equiv="X-UA-Compatible", content="IE=edge,chrome=1")'));

        assert.equal('<div style="background: url(/images/test.png)">Foo</div>', render("div(style= 'background: url(/images/test.png)') Foo"));
        assert.equal('<div style="background = url(/images/test.png)">Foo</div>', render("div(style= 'background = url(/images/test.png)') Foo"));
        assert.equal('<div style="foo">Foo</div>', render("div(style= ['foo', 'bar'][0]) Foo"));
        assert.equal('<div style="bar">Foo</div>', render("div(style= { foo: 'bar', baz: 'raz' }['foo']) Foo"));
        assert.equal('<a href="def">Foo</a>', render("a(href='abcdefg'.substr(3,3)) Foo"));
        assert.equal('<a href="def">Foo</a>', render("a(href={test: 'abcdefg'}.test.substr(3,3)) Foo"));
        assert.equal('<a href="def">Foo</a>', render("a(href={test: 'abcdefg'}.test.substr(3,[0,3][1])) Foo"));
        
        assert.equal('<rss xmlns:atom="atom"></rss>', render("rss(xmlns:atom=\"atom\")"));
        assert.equal('<rss xmlns:atom="atom"></rss>', render("rss('xmlns:atom'=\"atom\")"));
        assert.equal('<rss xmlns:atom="atom"></rss>', render("rss(\"xmlns:atom\"='atom')"));
        assert.equal('<rss xmlns:atom="atom" foo="bar"></rss>', render("rss('xmlns:atom'=\"atom\", 'foo'= 'bar')"));
        assert.equal('<a data-obj="{ foo: \'bar\' }"></a>', render("a(data-obj= \"{ foo: 'bar' }\")"));
        
        assert.equal('<meta content="what\'s up? \'weee\'"/>', render('meta(content="what\'s up? \'weee\'")'));
    },

    'test class attr array': function(assert){
        assert.equal('<body class="foo bar baz"></body>', render('body(class=["foo", "bar", "baz"])'));
    },

    'test attr interpolation': function(assert){
        // Test single quote interpolation
        assert.equal('<a href="/user/12">tj</a>'
          , render("a(href='/user/#{id}') #{name}", { locals: { name: 'tj', id: 12 }}));

        assert.equal('<a href="/user/12-tj">tj</a>'
          , render("a(href='/user/#{id}-#{name}') #{name}", { locals: { name: 'tj', id: 12 }}));

        assert.equal('<a href="/user/&lt;script&gt;">tj</a>'
          , render("a(href='/user/#{id}') #{name}", { locals: { name: 'tj', id: '<script>' }}));

        // Test double quote interpolation
        assert.equal('<a href="/user/13">ds</a>'
          , render('a(href="/user/#{id}") #{name}', { locals: { name: 'ds', id: 13 }}));

        assert.equal('<a href="/user/13-ds">ds</a>'
          , render('a(href="/user/#{id}-#{name}") #{name}', { locals: { name: 'ds', id: 13 }}));

        assert.equal('<a href="/user/&lt;script&gt;">ds</a>'
          , render('a(href="/user/#{id}") #{name}', { locals: { name: 'ds', id: '<script>' }}));
    },
    
    'test attr parens': function(assert){
        assert.equal('<p foo="bar">baz</p>', render('p(foo=((("bar"))))= ((("baz")))'));
    },
    
    'test code attrs': function(assert){
        assert.equal('<p></p>', render('p(id= name)', { locals: { name: undefined }}));
        assert.equal('<p></p>', render('p(id= name)', { locals: { name: null }}));
        assert.equal('<p></p>', render('p(id= name)', { locals: { name: false }}));
        assert.equal('<p id=""></p>', render('p(id= name)', { locals: { name: '' }}));
        assert.equal('<p id="tj"></p>', render('p(id= name)', { locals: { name: 'tj' }}));
        assert.equal('<p id="default"></p>', render('p(id= name || "default")', { locals: { name: null }}));
        assert.equal('<p id="something"></p>', render("p(id= 'something')", { locals: { name: null }}));
        assert.equal('<p id="something"></p>', render("p(id = 'something')", { locals: { name: null }}));
        assert.equal('<p id="foo"></p>', render("p(id= (true ? 'foo' : 'bar'))"));
        assert.equal('<option value="">Foo</option>', render("option(value='') Foo"));
    },
    
    'test code attrs class': function(assert){
        assert.equal('<p class="tj"></p>', render('p(class= name)', { locals: { name: 'tj' }}));
        assert.equal('<p class="tj"></p>', render('p( class= name )', { locals: { name: 'tj' }}));
        assert.equal('<p class="default"></p>', render('p(class= name || "default")', { locals: { name: null }}));
        assert.equal('<p class="foo default"></p>', render('p.foo(class= name || "default")', { locals: { name: null }}));
        assert.equal('<p class="default foo"></p>', render('p(class= name || "default").foo', { locals: { name: null }}));
        assert.equal('<p id="default"></p>', render('p(id = name || "default")', { locals: { name: null }}));
        assert.equal('<p id="user-1"></p>', render('p(id = "user-" + 1)'));
        assert.equal('<p class="user-1"></p>', render('p(class = "user-" + 1)'));
    },

    'test code buffering': function(assert){
        assert.equal('<p></p>', render('p= null'));
        assert.equal('<p></p>', render('p= undefined'));
        assert.equal('<p>0</p>', render('p= 0'));
        assert.equal('<p>false</p>', render('p= false'));
    },
    
    'test comments': function(assert){
        // Regular
        var str = [
            '//foo',
            'p bar'
        ].join('\n');

        var html = [
            '<!--foo-->',
            '<p>bar</p>'
        ].join('');

        assert.equal(html, render(str));
        
        // Arbitrary indentation
        
        var str = [
            '     //foo',
            'p bar'
        ].join('\n');

        var html = [
            '<!--foo-->',
            '<p>bar</p>'
        ].join('');

        assert.equal(html, render(str));
        
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

        assert.equal(html, render(str));

        // Quotes

        var str = "<!-- script(src: '/js/validate.js') -->",
            js = "// script(src: '/js/validate.js') ";
        assert.equal(str, render(js));
    },
    
    'test unbuffered comments': function(assert){
        var str = [
            '//- foo',
            'p bar'
        ].join('\n');

        var html = [
            '<p>bar</p>'
        ].join('');

        assert.equal(html, render(str));
        
        var str = [
            'p foo',
            '//- bar ',
            'p baz'
        ].join('\n');

        var html = [
            '<p>foo</p>',
            '<p>baz</p>'
        ].join('');

        assert.equal(html, render(str));
    },
    
    'test literal html': function(assert){
        assert.equal('<!--[if IE lt 9]>weeee<![endif]-->\n', render('<!--[if IE lt 9]>weeee<![endif]-->'));
    },
    
    'test code': function(assert){
        assert.equal('test', render('!= "test"'));
        assert.equal('test', render('= "test"'));
        assert.equal('test', render('- var foo = "test"\n=foo'));
        assert.equal('foo\n<em>test</em>bar\n', render('- var foo = "test"\n| foo\nem= foo\n| bar'));
        assert.equal('test<h2>something</h2>', render('!= "test"\nh2 something'));

        var str = [
            '- var foo = "<script>";',
            '= foo',
            '!= foo'
        ].join('\n');

        var html = [
            '&lt;script&gt;',
            '<script>'
        ].join('');

        assert.equal(html, render(str));
        
        var str = [
            '- var foo = "<script>";',
            '- if (foo)',
            '  p= foo'
        ].join('\n');

        var html = [
            '<p>&lt;script&gt;</p>'
        ].join('');

        assert.equal(html, render(str));
        
        var str = [
            '- var foo = "<script>";',
            '- if (foo)',
            '  p!= foo'
        ].join('\n');

        var html = [
            '<p><script></p>'
        ].join('');

        assert.equal(html, render(str));
        
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

        assert.equal(html, render(str));
        
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

        assert.equal(html, render(str));

        var str = [
            'p foo',
            '= "bar"',
        ].join('\n');

        var html = [
            '<p>foo</p>bar'
        ].join('');

        assert.equal(html, render(str));

        var str = [
            'title foo',
            '- if (true)',
            '  p something',
        ].join('\n');
        
        var html = [
            '<title>foo</title><p>something</p>'
        ].join('');
        
        assert.equal(html, render(str));

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

        assert.equal(html, render(str));
    },
    
    'test - each': function(assert){
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
        
        assert.equal(html, render(str));

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

        assert.equal(html, render(str));
        
        // Empty array
        var str = [
            '- var items = [];',
            '- each item in items',
            '  li= item'
        ].join('\n');
    
        assert.equal('', render(str));

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
        
        assert.equal(html, render(str));
        
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
        
        assert.equal(html, render(str));
        
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
        
        assert.equal(html, render(str));
        
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

        assert.equal(html, render(str));
    },
    
    'test renderFile() fs exception': function(assert, beforeExit){
        var called;
        jade.renderFile('foo', function(err, str){
            called = true;
            assert.equal(ENOENT, err.errno);
            assert.equal(undefined, str);
        });
        beforeExit(function(){
            assert.ok(called);
        });
    },
    
    'test renderFile() with valid path': function(assert, beforeExit){
        var called;
        jade.renderFile(__dirname + '/fixtures/layout.jade', function(err, str){
            called = true;
            assert.equal(null, err);
            assert.equal('<html><body><h1>Jade</h1></body></html>', str);
        });
        beforeExit(function(){
            assert.ok(called);
        });
    },
    
    'test renderFile() with options': function(assert, beforeExit){
        var called = 0;
        jade.renderFile(__dirname + '/fixtures/layout.jade', { cache: true }, function(err, str){
            ++called;
            assert.equal(null, err);
            assert.equal('<html><body><h1>Jade</h1></body></html>', str);

            jade.renderFile(__dirname + '/fixtures/layout.jade', { cache: true }, function(err, str){
                ++called;
                assert.equal(null, err);
                assert.equal('<html><body><h1>Jade</h1></body></html>', str);
            });
        });
        beforeExit(function(){
            assert.equal(2, called);
        });
    },
    
    'test renderFile() passing of exceptions': function(assert, beforeExit){
        var called = 0;
        jade.renderFile(__dirname + '/fixtures/invalid.jade', { cache: true }, function(err, str){
            ++called;
            assert.ok(typeof err.message === 'string', 'Test passing of exceptions to renderFile() callback');
            assert.equal(undefined, str);
        });
        beforeExit(function(){
            assert.equal(1, called);
        });
    },
    
    'test .compile()': function(assert){
        var fn = jade.compile('p foo');
        assert.equal('<p>foo</p>', fn());
    },
    
    'test .compile() locals': function(assert){
        var fn = jade.compile('p= foo');
        assert.equal('<p>bar</p>', fn({ foo: 'bar' }));
    },
    
    'test .compile() scope': function(assert){
        var fn = jade.compile('p= this.foo');
        assert.equal('<p>bar</p>', fn.call({ foo: 'bar' }));
    },
    
    'test null attrs on tag': function(assert){
        var tag = new jade.nodes.Tag('a'),
            name = 'href',
            val = '"/"';
        tag.setAttribute(name, val)
        assert.equal(tag.getAttribute(name), val)
        tag.removeAttribute(name)
        assert.isUndefined(tag.getAttribute(name))
    }
};
