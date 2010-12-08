
/*!
 * Jade - Parser
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer'),
    nodes = require('./nodes');

/**
 * Initialize `Parser` with the given input `str` and `filename`.
 *
 * @param {String} str
 * @param {String} filename
 * @api public
 */

var Parser = module.exports = function Parser(str, filename){
    this.input = str;
    this.lexer = new Lexer(str);
    this.filename = filename;
};

/**
 * Parser prototype.
 */

Parser.prototype = {
    
    /**
     * Output parse tree to stdout. 
     *
     * @api public
     */
    
    debug: function(){
        var lexer = new Lexer(this.input),
            tree = require('sys').inspect(this.parse(), false, 12, true);
        console.log('\n\x1b[1mParse Tree\x1b[0m:\n');
        console.log(tree);
        this.lexer = lexer;
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
        return this.lookahead(1);
    },
    
    /**
     * Return lexer lineno.
     *
     * @return {Number}
     * @api private
     */
    
    get line() {
        return this.lexer.lineno;
    },
    
    /**
     * `n` token lookahead.
     *
     * @param {Number} n
     * @return {Object}
     * @api private
     */
    
    lookahead: function(n){
        return this.lexer.lookahead(n);
    },
    
    /**
     * Parse input returning a string of js for evaluation.
     *
     * @return {String}
     * @api public
     */
    
    parse: function(){
        var block = new nodes.Block;
        block.line = this.line;
        while (this.peek.type !== 'eos') {
            if (this.peek.type === 'newline') {
                this.advance;
            } else {
                block.push(this.parseExpr());
            }
        }
        return block;
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
     * Accept the given `type`.
     *
     * @param {String} type
     * @api private
     */
    
    accept: function(type){
        if (this.peek.type === type) {
            return this.advance;
        }
    },
    
    /**
     *   tag
     * | doctype
     * | filter
     * | comment
     * | text
     * | each
     * | code
     * | id
     * | class
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
                return this.parseText();
            case 'each':
                return this.parseEach();
            case 'code':
                return this.parseCode();
            case 'id':
            case 'class':
                var tok = this.advance;
                this.lexer.defer(this.lexer.tok('tag', 'div'));
                this.lexer.defer(tok);
                return this.parseExpr();
        }
    },
    
    /**
     * Text
     */
    
    parseText: function(){
        var tok = this.expect('text'),
            node = new nodes.Text(tok.val);
        node.line = this.line;
        return node;
    },
    
    /**
     * code
     */
    
    parseCode: function(){
        var tok = this.expect('code'),
            node = new nodes.Code(tok.val, tok.buffer, tok.escape);
        node.line = this.line;
        if ('indent' == this.peek.type) {
            node.block = this.parseBlock();
        }
        return node;
    },
    
    /**
     * comment
     */
    
    parseComment: function(){
        var tok = this.expect('comment'),
            node = new nodes.Comment(tok.val, tok.buffer);
        node.line = this.line;
        return node;
    },
    
    /**
     * doctype
     */
    
    parseDoctype: function(){
        var tok = this.expect('doctype'),
            node = new nodes.Doctype(tok.val);
        node.line = this.line;
        return node;
    },
    
    /**
     * filter attrs? (text | block)
     */
    
    parseFilter: function(){
        var block,
            tok = this.expect('filter'),
            attrs = this.accept('attrs');
        if (this.lookahead(2).type == 'text') {
            block = this.parseTextBlock();
        } else {
            block = this.parseBlock();
        }
        var node = new nodes.Filter(tok.val, block, attrs && attrs.attrs);
        node.line = this.line;
        return node;
    },
    
    /**
     * each block
     */
    
    parseEach: function(){
        var tok = this.expect('each'),
            node = new nodes.Each(tok.code, tok.val, tok.key, this.parseBlock());
        node.line = this.line;
        return node;
    },
    
    /**
     * indent (text | newline)* outdent
     */
     
    parseTextBlock: function(){
        var text = new nodes.Text;
        text.line = this.line;
        this.expect('indent');
        while (this.peek.type === 'text' || this.peek.type === 'newline') {
            if (this.peek.type === 'newline') {
                this.advance;
            } else {
                text.push(this.advance.val);
            }
        }
        this.expect('outdent');
        return text;
    },
    
    /**
     * indent expr* outdent
     */
    
    parseBlock: function(){
        var block = new nodes.Block;
        block.line = this.line;
        this.expect('indent');
        while (this.peek.type !== 'outdent') {
            if (this.peek.type === 'newline') {
                this.advance;
            } else {
                block.push(this.parseExpr());
            }
        }
        this.expect('outdent');
        return block;
    },
    
    /**
     * tag (attrs | class | id)* (text | code)? newline* block?
     */
    
    parseTag: function(){
        var name = this.advance.val,
            tag = new nodes.Tag(name);
        tag.line = this.line;

        // (attrs | class | id)*
        out:
            while (true) {
                switch (this.peek.type) {
                    case 'id':
                    case 'class':
                        var tok = this.advance;
                        tag.setAttribute(tok.type, "'" + tok.val + "'");
                        continue;
                    case 'attrs':
                        var obj = this.advance.attrs,
                            names = Object.keys(obj);
                        for (var i = 0, len = names.length; i < len; ++i) {
                            var name = names[i],
                                val = obj[name];
                            tag.setAttribute(name, val);
                        }
                        continue;
                    default:
                        break out;
                }
            }

        // (text | code)?
        switch (this.peek.type) {
            case 'text':
                tag.text = this.parseText();
                break;
            case 'code':
                tag.code = this.parseCode();
                break;
        }

        // newline*
        while (this.peek.type === 'newline') this.advance;

        // Assume newline when tag followed by text
        if (this.peek.type === 'text') {
          if (tag.text) tag.text.push('\\n');
          else tag.text = new nodes.Text('\\n');
        }

        // block?
        if (this.peek.type === 'indent') {
            var block = this.parseBlock();
            if (tag.block) {
                for (var i = 0, len = block.length; i < len; ++i) {
                    tag.block.push(block[i]);
                }
            } else {
                tag.block = block;
            }
        }
        
        return tag;
    }
};