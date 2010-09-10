
/*!
 * Jade - Compiler
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var doctypes = require('./doctypes');

/**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @api private
 */

var Compiler = module.exports = function Compiler(node) {
    this.node = node;
};

/**
 * Compiler prototype.
 */

Compiler.prototype = {
    compile: function(){
        this.buf = ['var buf = [];'];
        this.visit(this.node);
        this.buf.push("return buf.join('');")
        console.log(this.buf.join('\n'));
        return this.buf.join('\n')
    },
    
    buffer: function(str){
        return this.buf.push("buf.push('" + str + "');");
    },
    
    visit: function(node){
        return this['visit' + node.constructor.name](node);
    },
    
    visitRoot: function(root){
        this.visitBlock(root.block);
    },

    visitBlock: function(block){
        for (var i = 0, len = block.nodes.length; i < len; ++i) {
            this.visit(block.nodes[i]);
        }
    },
    
    visitDoctype: function(doctype){
        var name = doctype.val;
        if ('5' == name) this.mode = 'html 5';
        doctype = doctypes[name || 'default'];
        this.buffer(doctype);
    },
    
    visitTag: function(tag){
        console.dir(tag)
    }
};


/**
 * Dummy iteration template.
 */

var iterate = (function(){
    var __vals = __obj__;
    if (__vals instanceof Array) {
        for (var i = 0, len = __vals.length; i < len; ++i) {
            var __key__ = i;
            var __val__ = __vals[i];
            __block__
        }
    } else if (typeof __vals === 'object') {
        var keys = Object.keys(__vals);
        for (var i = 0, len = keys.length; i < len; ++i) {
            var __key__ = keys[i];
            var __val__ = __vals[__key__];
            __block__
        }
    } else {
        var __val__ = __vals;
        __block__
    }
}).toString();

/**
 * Convert interpolation in the given string to JavaScript.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function interpolate(str){
    return str.replace(/(\\)?[#$]{(.*?)}/g, function(str, escape, code){
        return escape
            ? str
            : "' + (" + code.replace(/\\'/g, "'") + ") + '";
    });
}