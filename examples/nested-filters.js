
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade'),
    nodes = jade.nodes,
    Compiler = jade.Compiler;

jade.renderFile(__dirname + '/nested-filters.jade', function(err, html){
    if (err) throw err;
    console.log(html);
});

jade.filters.stylesheets = function(block, compiler){
    return new Visitor(block, compiler.options).compile();
};

function Visitor(node, options) {
    Compiler.call(this, node, options);
}

// Inherit from Compiler

Visitor.prototype.__proto__ = Compiler.prototype;

// Overwrite visitTag method 

Visitor.prototype.visitTag = function(node){
    var parent = Compiler.prototype.visitTag;
    switch (node.name) {
        case 'stylesheet':
            var style = new nodes.Tag('link');
            style.setAttribute('rel', "'stylesheet'");
            style.setAttribute('href', "'" + node.attrs[0].name + "'")
            parent.call(this, style);
            break;
        default:
            parent.call(this, node);
    }
};
