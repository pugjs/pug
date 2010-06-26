
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
    
    'test invalid indentation multiple': function(assert){
        var err;
        try {
            render('ul\n li');
        } catch (e) {
            err = e;
        }
        assert.equal('Jade(2): Invalid indentation, got 1 space, must be a multiple of two.', err.message);
        
        var err;
        try {
            render('ul\n   li');
        } catch (e) {
            err = e;
        }
        assert.equal('Jade(2): Invalid indentation, got 3 spaces, must be a multiple of two.', err.message);
    },
    
    'test attrs': function(assert){
        assert.equal('<img src="&lt;script&gt;" />', render('img(src="<script>")'), 'Test attr escaping');
        
        assert.equal('<img src="/foo.png" />', render('img(src="/foo.png")'), 'Test attr =');
        assert.equal('<img src="/foo.png" />', render('img(src  =  "/foo.png")'), 'Test attr = whitespace');
        assert.equal('<img src="/foo.png" />', render('img(src:"/foo.png")'), 'Test attr :');
        assert.equal('<img src="/foo.png" />', render('img(src  :  "/foo.png")'), 'Test attr : whitespace');
        
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src: "/foo.png", alt: "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src   : "/foo.png", alt  :  "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src="/foo.png", alt="just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src = "/foo.png", alt = "just some foo")'));
    }
};