
/*!
 * Jade - Compiler
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var filters = require('./filters'),
    doctypes = require('./doctypes'),
    selfClosing = require('./self-closing');

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
    
    buffer: function(str, esc){
        if (esc) str = escape(str);
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
        if ('5' == name) this.terse = true;
        doctype = doctypes[name || 'default'];
        this.buffer(doctype);
    },
    
    visitTag: function(tag){
        var name = tag.name
        if (~selfClosing.indexOf(name)) {
            this.buffer('<' + name);
            this.visitAttributes(tag.attrs);
            this.terse
                ? this.buffer('>')
                : this.buffer('/>');
        } else {
            this.buffer('<' + name + '>');
            this.visitBlock(tag.block);
            this.buffer('</' + name + '>');
        }
    },
    
    visitFilter: function(filter){
        var fn = filters[filter.name];
        if (!fn) throw new Error('unknown filter ":' + filter.name + '"');
        this.buffer(fn(text(filter.text)));
    },
    
    visitText: function(node){
        this.buffer(text(node));
    },
    
    visitComment: function(comment){
        if (comment.buffer) {
            this.buffer('<!--' + comment.val + '-->');
        }
    },
    
    visitAttributes: function(attrs){
        var buf = [];
        if (this.terse) buf.push('terse: true');
        attrs.forEach(function(attr){
            var pair = "'" + attr.name + "':" + attr.val;
            buf.push(pair);
        });
        this.buf.push("buf.push(attrs({ " + buf.join(', ') + " }));");
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

function text(node){
    return interpolate(node.lines.join('\\n'));
}

function escape(str) {
    return str.replace(/'/g, "\\'");
}