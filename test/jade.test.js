
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

        assert.equal(html, render(str));
    },
    
    'test attrs': function(assert){
        assert.equal('<img src="&lt;script&gt;" />', render('img(src="<script>")'));
        
        assert.equal('<img src="/foo.png" />', render('img(src="/foo.png")'));
        assert.equal('<img src="/foo.png" />', render('img(src  =  "/foo.png")'));
        assert.equal('<img src="/foo.png" />', render('img(src:"/foo.png")'));
        assert.equal('<img src="/foo.png" />', render('img(src  :  "/foo.png")'));
        
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src: "/foo.png", alt: "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src   : "/foo.png", alt  :  "just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src="/foo.png", alt="just some foo")'));
        assert.equal('<img src="/foo.png" alt="just some foo" />', render('img(src = "/foo.png", alt = "just some foo")'));
    }
};