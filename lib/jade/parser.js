
/*!
 * Jade - Parser
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer'),
    nodes = require('./nodes'),
    filters = require('./filters'),
    doctypes = require('./doctypes'),
    selfClosing = require('./self-closing');

/**
 * Initialize `Parser` with the given input `str` and `filename`.
 *
 * @param {String} str
 * @param {String} filename
 * @api public
 */

var Parser = module.exports = function Parser(str, filename){
    this.lexer = new Lexer(str);
    this.filename = filename;
};

/**
 * Parser prototype.
 */

Parser.prototype = {
    
    /**
     * Output token stack for debugging. 
     *
     * @api private
     */
    
    debug: function(){
        var tok, width = 8;
        while ((tok = this.advance).type !== 'eos') {
            var type = tok.type,
            pad = width - type.length;
            while (pad--) type += ' ';
            console.log('%d : \x1b[1m%s\x1b[0m %j',
                tok.line,
                type,
                tok.val);
        }
    },
    
    /**
     * Return the next token object.
     *
     * @return {Object}
     * @api private
     */

    get advance(){
        return this.lexer.advance;
    },
    
    /**
     * Single token lookahead.
     *
     * @return {Object}
     * @api private
     */
    
    get peek() {
        return this.lexer.peek;
    },
    
    /**
     * Instrument template lineno.
     *
     * @return {String}
     * @api private
     */
    
    get line() {
        return '_.lineno = ' + this.lexer.lineno + ';';
    },
    
    /**
     * Parse input returning a string of js for evaluation.
     *
     * @return {String}
     * @api public
     */
    
    parse: function(){
        var block = new nodes.Block;
        while (this.peek.type !== 'eos') {
            block.push(this.parseExpr());
        }
        console.log(require('sys').inspect(block, false, 12, true))
        return new nodes.Root(block);
    },
    
    /**
     * Expect the given type, or throw an exception.
     *
     * @param {String} type
     * @api private
     */
    
    expect: function(type){
        if (this.peek.type === type) {
            return this.advance;
        } else {
            throw new Error('expected "' + type + '", but got "' + this.peek.type + '"');
        }
    },
    
    /**
     *   tag
     * | id
     * | class
     * | text
     * | filter
     * | doctype
     * | comment
     * | each block
     * | code block?
     * | expr newline 
     */
    
    parseExpr: function(){
        switch (this.peek.type) {
            case 'tag':
                return this.parseTag();
            case 'doctype':
                return this.parseDoctype();
            case 'filter':
                return this.parseFilter();
            case 'comment':
                return this.parseComment();
            case 'text':
                return "buf.push('" + interpolate(this.advance.val.replace(/'/g, "\\'")) + " ');";
            case 'each':
                return this.parseEach();
            case 'code':
                return this.parseCode();
            case 'newline':
                this.advance;
                return this.parseExpr();
            case 'id':
            case 'class':
                var tok = this.advance;
                this.lexer.defer(this.lexer.tok('tag', 'div'));
                this.lexer.defer(tok);
                return this.parseExpr();
        }
    },
    
    /**
     * code
     */
    
    parseCode: function(){
        var tok = this.advance,
            node = new nodes.Code(tok.val, tok.buffer);
        if ('indent' == this.peek.type) {
            node.block = this.parseBlock();
        }
        return node;
    },
    
    /**
     * comment
     */
    
    parseComment: function(){
        var tok = this.expect('comment');
        return new nodes.Comment(tok.val, tok.buffer);
    },
    
    /**
     * doctype
     */
    
    parseDoctype: function(){
        var tok = this.expect('doctype');
        return new nodes.Doctype(tok.val);
    },
    
    /**
     * filter text
     */
    
    parseFilter: function(){
        var tok = this.expect('filter');
        return new nodes.Filter(tok.val, this.parseTextBlock());
    },
    
    /**
     * each block
     */
    
    parseEach: function(){
        var tok = this.expect('each');
        return new nodes.Each(tok.code, tok.val, tok.key, this.parseBlock());
    },
    
    /**
     * indent (text | newline)* outdent
     */
     
    parseTextBlock: function(){
        var textBlock = new nodes.TextBlock;
        this.expect('indent');
        while (this.peek.type === 'text' || this.peek.type === 'newline') {
            if (this.peek.type === 'newline') {
                this.advance;
                textBlock.addLine(new nodes.Text('\n'));
            } else {
                textBlock.addLine(this.advance);
            }
        }
        this.expect('outdent');
        return textBlock;
    },
    
    /**
     * indent expr* outdent
     */
    
    parseBlock: function(){
        var block = new nodes.Block;
        this.expect('indent');
        while (this.peek.type !== 'outdent') {
            block.push(this.parseExpr());
        }
        this.expect('outdent');
        return block;
    },
    
    /**
     * tag (attrs | class | id)* text? code? newline* block?
     */
    
    parseTag: function(){
        var name = this.advance.val,
            tag = new nodes.Tag(name);
        
        // (attrs | class | id)*
        out:
            while (1) {
                switch (this.peek.type) {
                    case 'id':
                    case 'class':
                        var tok = this.advance;
                        tag.addAttribute(new nodes.Attribute(tok.type, tok.val));
                        continue;
                    case 'attrs':
                        var obj = this.advance.attrs,
                            names = Object.keys(obj);
                        for (var i = 0, len = names.length; i < len; ++i) {
                            var name = names[i],
                                val = obj[name];
                            tag.addAttribute(new nodes.Attribute(name, val));
                        }
                        continue;
                    default:
                        break out;
                }
            }

        // text?
        if (this.peek.type === 'text') {
            tag.text = new nodes.Text(this.advance);
        }

        // code?
        if (this.peek.type === 'code') {
            var tok = this.advance;
            tag.code = new nodes.Code(tok.val, tok.buffer);
        }

        // newline*
        while (this.peek.type === 'newline') this.advance;

        // block?
        if (this.peek.type === 'indent') {
            tag.block = this.parseBlock();
        }
        
        return tag;
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