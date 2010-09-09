
/**
 * Module dependencies.
 */

var jade = require('jade'),
    Buffer = require('buffer').Buffer;

// Shortcut

var render = jade.render;

module.exports = {
    'version': function(assert){
        assert.ok(/^\d+\.\d+\.\d+$/.test(jade.version), "Invalid version format");
    },
    
    'test doctypes': function(assert){
        assert.equal('<?xml version="1.0" encoding="utf-8" ?>', render('!!! xml'));
        assert.equal('<!DOCTYPE html>', render('!!! 5'));
    },
    
    'test unknown filter': function(assert){
        var err;
        try {
            render(':doesNotExist');
        } catch (e) {
            err = e;
        }
        assert.equal("Jade:1\n    1. ':doesNotExist'\n\nunknown filter \":doesNotExist\"", err.message);
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
            '<img />'
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
            '<img />'
        ].join('');

        assert.equal(html, render(str));
    },
    
    'test single quotes': function(assert){
        assert.equal("<p>'foo'</p>", render("p 'foo'"));
        assert.equal("<p>'foo' </p>", render("p\n  | 'foo'"));
        assert.equal('<a href="/foo"></a>', render("- var path = 'foo';\na(href='/' + path)"));
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
            '<img />'
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
        assert.equal('<div class="bar baz foo"></div>', render('div(class="foo").bar.baz'));
        assert.equal('<div class="foo baz bar"></div>', render('div.foo(class="bar").baz'));
        assert.equal('<div class="foo bar baz"></div>', render('div.foo.bar(class="baz")'));
        assert.equal('<div class="a-b2"></div>', render('div.a-b2'));
        assert.equal('<div class="a_b2"></div>', render('div.a_b2'));
        assert.equal('<fb:user></fb:user>', render('fb:user'));
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
            'a(href="#") foo ',
            '  | bar',
            '  | baz'
        ].join('\n');
        
        assert.equal('<a href="#">foo bar baz </a>', render(str));
        
        var str = [
            'ul',
            '  li one',
            '  ul two',
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
    
    'test tag text': function(assert){
        assert.equal('some random text ', render('| some random text'));
        assert.equal('<p>some random text</p>', render('p some random text'));
        assert.equal('<p>(parens)</p>', render('p (parens)'));
        //assert.equal('<p foo="bar">(parens)</p>', render('p(foo="bar") (parens)'));
    },
    
    'test tag text block': function(assert){
        assert.equal('<p>foo bar baz </p>', render('p\n  | foo\n  | bar\n  | baz'));
        assert.equal('<label>Password: <input /></label>', render('label\n  | Password:\n  input'));
    },
    
    'test tag text interpolation': function(assert){
        assert.equal('yo, jade is cool ', render('| yo, #{name} is cool', { locals: { name: 'jade' }}));
        assert.equal('yo, jade is cool ', render('| yo, ${name} is cool', { locals: { name: 'jade' }}));
        assert.equal('<p>yo, jade is cool</p>', render('p yo, #{name} is cool', { locals: { name: 'jade' }}));
        assert.equal('<p>yo, jade is cool</p>', render('p yo, ${name} is cool', { locals: { name: 'jade' }}));
        assert.equal('yo, jade is cool ', render('| yo, #{name || "jade"} is cool', { locals: { name: null }}));
        assert.equal('yo, \'jade\' is cool ', render('| yo, #{name || "\'jade\'"} is cool', { locals: { name: null }}));
        assert.equal('yo, jade is cool ', render('| yo, ${name || \'jade\'} is cool', { locals: { name: null }}));
    },
    
    'test invalid indentation multiple': function(assert){
        var err;
        try {
            render('\n\nul\n  li\n li');
        } catch (e) {
            err = e;
        }
        assert.equal(
            "Jade:5\n    3. 'ul'\n    4. '  li'\n    5. ' li'\n\nInvalid indentation, got 1 space, must be a multiple of two.",
            err.message);
        
        var err;
        try {
            render('ul\n   li', { filename: 'path/to/foo.jade' });
        } catch (e) {
            err = e;
        }
        assert.equal('path/to/foo.jade', err.path);
        assert.equal(
            "path/to/foo.jade:2\n    1. 'ul'\n    2. '   li'\n\nInvalid indentation, got 3 spaces, must be a multiple of two.",
            err.message);
    },
    
    'test invalid indents': function(assert){
        var err;
        try {
            render('ul\n\n\n    li');
        } catch (e) {
            err = e;
        }
        assert.equal(
            "Jade:4\n    2. ''\n    3. ''\n    4. '    li'\n\nInvalid indentation, got 2 expected 1.",
            err.message);
    },
    
    'test code exceptions': function(assert){
        var err;
        try {
            render('p= foo', { cache: true, filename: 'foo', locals: { foo: 'bar' }});
            render('p= foo', { cache: true, filename: 'foo' });
        } catch (e) {
            err = e;
        }
        assert.equal(
            "foo:1\n    1. 'p= foo'\n\nfoo is not defined",
            err.message);
    },
    
    'test interpolation exceptions': function(assert){
        var err;
        try {
            render('p #{foo}');
        } catch (e) {
            err = e;
        }
        assert.equal(
            "Jade:1\n    1. 'p #{foo}'\n\nfoo is not defined",
            err.message);

        var err;
        try {
            render([
                'p',
                'p #{foo}',
            ].join('\n'));
        } catch (e) {
            err = e;
        }
        assert.equal(
            "Jade:2\n    1. 'p'\n    2. 'p #{foo}'\n\nfoo is not defined",
            err.message);
    },
    
    'test text block exceptions': function(assert){
        var err;
        try {
            render([
                'p',
                '  | foo',
                '  | bar',
                '  | #{baz}',
                '  | raz'
            ].join('\n'));
        } catch (e) {
            err = e;
        }
        assert.equal(
            "Jade:4\n    2. '  | foo'\n    3. '  | bar'\n    4. '  | #{baz}'\n\nbaz is not defined",
            err.message);
    },
    
    'test filter text block exceptions': function(assert){
        var err;
        try {
            render([
                ':javascript',
                '  | foo',
                '  | bar',
                '  | bar',
                '  | bar',
                '  | bar',
                '  | #{baz}',
                '  | raz'
            ].join('\n'));
        } catch (e) {
            err = e;
        }
        assert.equal(
            "Jade:8\n    6. '  | bar'\n    7. '  | #{baz}'\n    8. '  | raz'\n\nbaz is not defined",
            err.message);
    },
    
    'test html 5 mode': function(assert){
        assert.equal('<!DOCTYPE html><input type="checkbox" checked>', render('!!! 5\ninput(type="checkbox", checked)'));
        assert.equal('<!DOCTYPE html><input type="checkbox" checked>', render('!!! 5\ninput(type="checkbox", checked: true)'));
        assert.equal('<!DOCTYPE html><input type="checkbox">', render('!!! 5\ninput(type="checkbox", checked: false)'));
    },
    
    'test attrs': function(assert){
        assert.equal('<img src="&lt;script&gt;" />', render('img(src="<script>")'), 'Test attr escaping');
        
        assert.equal('<a data-attr="bar"></a>', render('a(data-attr:"bar")'));
        assert.equal('<a data-attr="bar" data-attr-2="baz"></a>', render('a(data-attr:"bar", data-attr-2:"baz")'));
        
        assert.equal('<a title="foo,bar"></a>', render('a(title: "foo,bar")'));
        assert.equal('<a title="foo,bar" href="#"></a>', render('a(title: "foo,bar", href="#")'));
        
        assert.equal('<p class="foo"></p>', render("p(class='foo')"), 'Test single quoted attrs');
        assert.equal('<input type="checkbox" checked="checked" />', render('input( type="checkbox", checked )'));
        assert.equal('<input type="checkbox" checked="checked" />', render('input( type="checkbox", checked: true )'));
        assert.equal('<input type="checkbox" />', render('input(type="checkbox", checked: false)'));
        assert.equal('<input type="checkbox" />', render('input(type="checkbox", checked: null)'));
        assert.equal('<input type="checkbox" />', render('input(type="checkbox", checked: undefined)'));
        assert.equal('<input type="checkbox" />', render('input(type="checkbox", checked: "")'));
        
        assert.equal('<img src="/foo.png" />', render('img(src="/foo.png")'), 'Test attr =');
        assert.equal('<img src="/foo.png" />', render('img(src  =  "/foo.png")'), 'Test attr = whitespace');
        assert.equal('<img src="/foo.png" />', render('img(src:"/foo.png")'), 'Test attr :');
        assert.equal('<img src="/foo.png" />', render('img(src  :  "/foo.png")'), 'Test attr : whitespace');
        
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src: "/foo.png", alt: "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src   : "/foo.png", alt  :  "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src="/foo.png", alt="just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src = "/foo.png", alt = "just some foo")'));
        
        assert.equal('<p class="foo,bar,baz"></p>', render('p(class="foo,bar,baz")'));
        assert.equal('<a href="http://google.com" title="Some : weird = title"></a>', render('a(href: "http://google.com", title: "Some : weird = title")'));
        assert.equal('<label for="name"></label>', render('label(for="name")'));
        assert.equal('<meta name="viewport" content="width=device-width" />', render("meta(name: 'viewport', content: 'width=device-width')"), 'Test attrs that contain attr separators');
        assert.equal('<meta name="viewport" content="width=device-width" />', render("meta(name: 'viewport', content='width=device-width')"), 'Test attrs that contain attr separators');
        assert.equal('<div style="color: white"></div>', render("div(style='color: white')"), 'Test attrs that contain attr separators');
        assert.equal('<p class="foo"></p>', render("p('class'='foo')"), 'Test keys with single quotes');
        assert.equal('<p class="foo"></p>', render("p(\"class\": 'foo')"), 'Test keys with double quotes');
    },
    
    'test code attrs': function(assert){
        assert.equal('<p id="tj"></p>', render('p(id: name)', { locals: { name: 'tj' }}));
        assert.equal('<p id="default"></p>', render('p(id: name || "default")', { locals: { name: null }}));
        assert.equal('<p id="something"></p>', render("p(id: 'something')", { locals: { name: null }}));
        assert.equal('<p id="something"></p>', render("p(id = 'something')", { locals: { name: null }}));
        assert.equal('<p id="foo"></p>', render("p(id: (true ? 'foo' : 'bar'))"));
    },
    
    'test code attrs class': function(assert){
        assert.equal('<p class="tj"></p>', render('p(class: name)', { locals: { name: 'tj' }}));
        assert.equal('<p class="tj"></p>', render('p( class: name )', { locals: { name: 'tj' }}));
        assert.equal('<p class="default"></p>', render('p(class: name || "default")', { locals: { name: null }}));
        assert.equal('<p class="foo default"></p>', render('p.foo(class: name || "default")', { locals: { name: null }}));
        assert.equal('<p class="foo default"></p>', render('p(class: name || "default").foo', { locals: { name: null }}));
        assert.equal('<p id="user-1"></p>', render('p(id: "user-" + 1)'));
        assert.equal('<p class="user-1"></p>', render('p(class: "user-" + 1)'));
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
    
    'test code': function(assert){
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
        
        // Non-Enumerable
        var str = [
            '- each val in 1',
            '  li= val'
        ].join('\n');
    
        var html = [
            '<li>1</li>'
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
            assert.equal(process.ENOENT, err.errno);
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
    }
};