
/**
 * Module dependencies.
 */

var jade = require('jade'),
    render = jade.render,
    nodes = jade.nodes;

jade.filters.conditionals = function(block, compiler){
    block.nodes.forEach(function(node, i){
        switch (node.name) {
            case 'if':
                block.nodes[i] = new nodes.Code('if (false)');
                block.nodes[i].block = node.block;
                break;
            case 'else':
                block.nodes[i] = new nodes.Code('else');
                block.nodes[i].block = node.block;
                break;
        }
    });
    compiler.visit(block);
    return '';
};

module.exports = {
    'test filter interpolation': function(assert){
        assert.equal(
            '<script type="text/javascript">\nvar name = "tj";</script>',
            render(':javascript\n  | var name = "#{userName}";', { locals: { userName: 'tj' }}));
        assert.equal(
            '<script type="text/javascript">\nvar name = \'tj\';</script>',
            render(':javascript\n  | var name = #{userName};', { locals: { userName: "'tj'" }}));
        assert.equal(
            '<script type="text/javascript">\nvar name = "#{userName}";</script>',
            render(':javascript\n  | var name = "\\#{userName}";', { locals: { userName: 'tj' }}));
    },
    
    'test :cdata filter': function(assert){
        assert.equal('<![CDATA[\nfoo\n]]>', render(':cdata\n  | foo'));
        assert.equal('<![CDATA[\nfoo\nbar\n]]>', render(':cdata\n  | foo\n  | bar'));
        assert.equal('<![CDATA[\nfoo\nbar\n]]><p>something else</p>', render(':cdata\n  | foo\n  | bar\np something else'));
    },
    
    'test :javascript filter': function(assert){
        assert.equal(
            '<script type="text/javascript">\nalert(\'foo\')</script>',
            render(':javascript\n  | alert(\'foo\')'));
    },
    
    'test :markdown filter': function(assert){
        assert.equal(
            '<h1>foo</h1>\n\n<ul><li>bar</li><li>baz</li></ul>',
            render(':markdown\n  | #foo\n  | - bar\n  | - baz'))
    },
    
    'test :sass filter': function(assert){
        assert.equal(
            '<style>body {\n  color: #cc0000;}\n</style>',
            render(':sass\n  | body\n  |   :color #cc0000'));
        assert.equal(
            '<style>body {\n  font-family: \'Lucida Grande\';}\n</style>',
            render(':sass\n  | body\n  |   :font-family \'Lucida Grande\''));
    },

    'test :less filter': function(assert){
        assert.equal(
            '<style>.class {\n  width: 20px;\n}\n</style>',
            render(':less\n  | .class { width: 10px * 2 }'));
    },
    
    'test parse tree': function(assert){
        var str = [
            ':conditionals',
            '  if false',
            '    p doh',
            '  else',
            '    p amazing!'
        ].join('\n');

        var html = [
            '<p>amazing!</p>'
        ].join('');

        assert.equal(html, render(str));
    }
};