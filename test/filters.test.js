
/**
 * Module dependencies.
 */

var jade = require('jade');

// Shortcut
var render = jade.render;

module.exports = {
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
    }
};