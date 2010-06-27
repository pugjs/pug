
/**
 * Module dependencies.
 */

var jade = require('jade');

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
    
    'test :cdata filter': function(assert){
        assert.equal('<![CDATA[\nfoo\n]]>', render(':cdata\n  | foo'));
        assert.equal('<![CDATA[\nfoo\nbar\n]]>', render(':cdata\n  | foo\n  | bar'));
        assert.equal('<![CDATA[\nfoo\nbar\n]]><p>something else</p>', render(':cdata\n  | foo\n  | bar\np something else'));
    },
    
    'test :javascript filter': function(assert){
        assert.equal(
            '<script type="text/javascript">\n//<![CDATA[\nfoo\n//]]></script>',
            render(':javascript\n  | foo'));
    },
    
    'test :markdown filter': function(assert){
        assert.equal(
            '<h1>foo</h1>\n\n<ul>\n<li>bar</li>\n<li>baz</li>\n</ul>\n',
            render(':markdown\n  | #foo\n  | - bar\n  | - baz'))
    },
    
    'test :sass filter': function(assert){
        assert.equal(
            '<style>body {\n  color: #cc0000;}\n</style>',
            render(':sass\n  | body\n  |   :color #cc0000'));
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

        assert.equal(html, render(str), 'Test nesting');
    },
    
    'test variable length newlines': function(assert){
        var str = [
            'ul',
            '  li a',
            '  ',
            '  li b',
            ' ',
            '  li',
            '    ul',
            '          ',
            ' ',
            '',
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

        assert.equal(html, render(str), 'Test nesting');
    },
    
    'test newlines': function(assert){
        var str = [
            'ul',
            '  li a',
            '  ',
            '  ',
            '  ',
            '  ',
            '  li b',
            '  li',
            '    ',
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

        assert.equal(html, render(str), 'Test newlines');
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
        assert.ok(typeof jade.cache['foo.jade'] === 'string', 'Test cache');
    },
    
    'test tag text': function(assert){
        assert.equal('some random text ', render('| some random text'), 'Test root text');
        assert.equal('<p>some random text</p>', render('p some random text'), 'Test basic tag text');
        assert.equal('<p>foo bar baz </p>', render('p\n  | foo\n  | bar\n  | baz'));
    },
    
    'test tag text interpolation': function(assert){
        assert.equal('yo, jade is cool ', render('| yo, #{name} is cool', { locals: { name: 'jade' }}));
        assert.equal('<p>yo, jade is cool</p>', render('p yo, #{name} is cool', { locals: { name: 'jade' }}));
        assert.equal('yo, jade is cool ', render('| yo, #{name || "jade"} is cool', { locals: { name: null }}));
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
    
    'test exceptions': function(assert){
        var err;
        try {
            render('p= foo');
        } catch (e) {
            err = e;
        }
        assert.equal(
            "Jade:1\n    1. 'p= foo'\n\nfoo is not defined",
            err.message);
    },
    
    'test attrs': function(assert){
        assert.equal('<img src="&lt;script&gt;" />', render('img(src="<script>")'), 'Test attr escaping');
        
        assert.equal('<p class="foo"></p>', render("p(class='foo')"), 'Test single quoted attrs');
        assert.equal('<input type="checkbox" checked="checked" />', render('input(type="checkbox", checked)'), 'Test boolean attrs');
        
        assert.equal('<img src="/foo.png" />', render('img(src="/foo.png")'), 'Test attr =');
        assert.equal('<img src="/foo.png" />', render('img(src  =  "/foo.png")'), 'Test attr = whitespace');
        assert.equal('<img src="/foo.png" />', render('img(src:"/foo.png")'), 'Test attr :');
        assert.equal('<img src="/foo.png" />', render('img(src  :  "/foo.png")'), 'Test attr : whitespace');
        
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src: "/foo.png", alt: "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src   : "/foo.png", alt  :  "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src="/foo.png", alt="just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src = "/foo.png", alt = "just some foo")'));
    },
    
    'test code attrs': function(assert){
        assert.equal('<p id="tj"></p>', render('p(id: name)', { locals: { name: 'tj' }}));
        assert.equal('<p id="default"></p>', render('p(id: name || "default")', { locals: { name: null }}));
    },
    
    'test code attrs class': function(assert){
        assert.equal('<p class="tj"></p>', render('p(class: name)', { locals: { name: 'tj' }}));
        assert.equal('<p class="default"></p>', render('p(class: name || "default")', { locals: { name: null }}));
        assert.equal('<p class="foo default"></p>', render('p.foo(class: name || "default")', { locals: { name: null }}));
        assert.equal('<p class="foo default"></p>', render('p(class: name || "default").foo', { locals: { name: null }}));
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
    },
    
    'test renderFile() fs exception': function(assert, beforeExit){
        var called = true;
        jade.renderFile('foo', function(err, str){
            assert.equal(process.ENOENT, err.errno);
            assert.equal(undefined, str);
        });
        beforeExit(function(){
            assert.ok(called);
        });
    },
    
    'test renderFile() with valid path': function(assert, beforeExit){
        var called = true;
        jade.renderFile(__dirname + '/fixtures/layout.jade', function(err, str){
            assert.equal(null, err);
            assert.equal('<html><body><h1>Jade</h1></body></html>', str);
        });
        beforeExit(function(){
            assert.ok(called);
        });
    },
    
    'test renderFile() with options': function(assert, beforeExit){
        var called = true;
        jade.renderFile(__dirname + '/fixtures/layout.jade', { cache: true }, function(err, str){
            assert.equal(null, err);
            assert.equal('<html><body><h1>Jade</h1></body></html>', str);
        });
        beforeExit(function(){
            assert.ok(called);
        });
    },
    
    'test renderFile() passing of exceptions': function(assert, beforeExit){
        var called = true;
        jade.renderFile(__dirname + '/fixtures/invalid.jade', { cache: true }, function(err, str){
            assert.ok(typeof err.message === 'string', 'Test passing of exceptions to renderFile() callback');
            assert.equal(undefined, str);
        });
        beforeExit(function(){
            assert.ok(called);
        });
    }
};