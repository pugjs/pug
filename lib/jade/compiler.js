
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
            this.buffer('<' + name);
            this.visitAttributes(tag.attrs);
            this.buffer('>');
            if (tag.code) this.visitCode(tag.code);
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
    
    visitCode: function(code){
        if (code.buffer) {
            this.buffer(code.val.trimLeft(), code.escape);
        } else {
            this.buf.push(code.val);
        }
        if (code.block) {
            this.buf.push('(function(){');
            this.visitBlock(code.block);
            this.buf.push('}).call(this);');
        }
    },
    
    visitEach: function(each){
        this.buf.push(''
            + '// iterate ' + each.obj + '\n'
            + '(function(){\n'
            + '  for (var ' + each.key + ' in ' + each.obj + ') {\n'
            + '    var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');
        this.visitBlock(each.block);
        this.buf.push('  }\n}).call(this);\n');
    },
    
    visitAttributes: function(attrs){
        var buf = [],
            classes = [];
        if (this.terse) buf.push('terse: true');
        attrs.forEach(function(attr){
            if (attr.name == 'class') {
                classes.push(attr.val);
            } else {
                var pair = "'" + attr.name + "':" + attr.val;
                buf.push(pair);
            }
        });
        if (classes.length) {
            classes = classes.join(" + ' ' + ");
            buf.push("class:" + classes);
        }
        this.buf.push("buf.push(attrs({ " + buf.join(', ') + " }));");
    }
};

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
    return interpolate(node.lines.join('\\n').trimLeft());
}

function escape(str) {
    return str.replace(/'/g, "\\'");
}