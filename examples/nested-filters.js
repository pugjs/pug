
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

// :javascripts

jade.filters.javascripts = function(block, compiler){
    return new JavascriptsVisitor(block, compiler.options).compile();
};

function JavascriptsVisitor(node, options) {
    Compiler.call(this, node, options);
}

// Inherit from Compiler

JavascriptsVisitor.prototype.__proto__ = Compiler.prototype;

// Overwrite visitTag method 

JavascriptsVisitor.prototype.visitTag = function(node){
    var parent = Compiler.prototype.visitTag;
    switch (node.name) {
        case 'js':
            var script = new nodes.Tag('script');
            script.setAttribute('type', "'text/javascript'");
            script.setAttribute('src', "'" + node.attrs[0].name + "'")
            parent.call(this, script);
            break;
        default:
            parent.call(this, node);
    }
};

// :stylesheets

jade.filters.stylesheets = function(block, compiler){
    return new StylesheetsVisitor(block, compiler.options).compile();
};

function StylesheetsVisitor(node, options) {
    Compiler.call(this, node, options);
}

// Inherit from Compiler

StylesheetsVisitor.prototype.__proto__ = Compiler.prototype;

// Overwrite visitTag method 

StylesheetsVisitor.prototype.visitTag = function(node){
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
