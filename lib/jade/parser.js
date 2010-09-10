
/*!
 * Jade - Parser
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer'),
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
            sys.puts(tok.line 
                + ' : \x1B[1m' + type + '\x1B[0m' 
                + ' ' + sys.inspect(tok.val)
                + (tok.attrs ? ' ' + sys.inspect(tok.attrs) : ''));
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
        var buf = ['var buf = [];'];
        while (this.peek.type !== 'eos') {
            buf.push(this.parseExpr());
        }
        buf.push("return buf.join('');");
        return buf.join('\n');
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
                return this.line + this.parseExpr();
            case 'id':
            case 'class':
                var tok = this.advance;
                this.lexer.deferredTokens.push({
                    val: 'div',
                    type: 'tag',
                    line: this.lexer.lineno
                });
                this.lexer.deferredTokens.push(tok);
                return this.parseExpr();
        }
    },
    
    /**
     * code
     */
    
    parseCode: function(){
        var tok = this.advance,
            val = tok.val;
        var buf = tok.buffer
            ? 'buf.push(' + (tok.escape
                ? 'escape(' + val + ')'
                : val) + ')'
            : val;
        return this.peek.type === 'indent'
            ? buf + '\n(function(){' + this.parseBlock() + '}).call(this);'
            : buf + ';';
    },
    
    /**
     * comment
     */
    
    parseComment: function(){
        var tok = this.expect('comment');
        return tok.buffer
            ? "buf.push('<!--" + tok.val.replace(/'/g, "\\'") + "-->')"
            : '';
    },
    
    /**
     * doctype
     */
    
    parseDoctype: function(){
        var name = this.expect('doctype').val;
        if (name === '5') this.mode = 'html 5';
        return "buf.push('" + doctypes[name || 'default'] + "');";
    },
    
    /**
     * filter text
     */
    
    parseFilter: function(){
        var name = this.expect('filter').val,
            filter = filters[name];
        if (filter) {
            var text = interpolate(this.parseTextBlock().replace(/'/g, "\\'"));
            return this.line + "buf.push('" + filter(text) + "');";
        } else {
            throw new Error('unknown filter ":' + name + '"');
        }
    },
    
    /**
     * each block
     */
    
    parseEach: function(){
        var each = this.expect('each');
        var fn = '(' + iterate
            .replace(/__obj__/, each.code)
            .replace(/__val__/g, each.val)
            .replace(/__key__/g, each.key)
            .replace(/__block__/g, this.parseBlock()) + ').call(this);';
        return fn;
    },
    
    /**
     * indent (text | newline)* outdent
     */
     
    parseTextBlock: function(){
        var buf = [];
        this.expect('indent');
        while (this.peek.type === 'text' || this.peek.type === 'newline') {
            if (this.peek.type === 'newline') {
                this.advance;
                buf.push('\\n');
            } else {
                buf.push(this.advance.val);
            }
        }
        this.expect('outdent');
        return buf.join('');
    },
    
    /**
     * indent expr* outdent
     */
    
    parseBlock: function(){
        var buf = [];
        buf.push(this.line); this.expect('indent');
        while (this.peek.type !== 'outdent') {
            buf.push(this.parseExpr());
        }
        this.expect('outdent');
        return buf.join('\n');
    },
    
    /**
     * tag (attrs | class | id)* text? code? newline* block?
     */
    
    parseTag: function(){
        var name = this.advance.val,
            html5 = this.mode === 'html 5',
            hasAttrs = false,
            attrBuf = '',
            codeClass = '',
            classes = [],
            attrs = {},
            buf = [];
        
        // (attrs | class | id)*
        out:
            while (1) {
                switch (this.peek.type) {
                    case 'id':
                        hasAttrs = true;
                        attrs.id = '"' + this.advance.val + '"';
                        continue;
                    case 'class':
                        hasAttrs = true;
                        classes.push(this.advance.val);
                        continue;
                    case 'attrs':
                        hasAttrs = true;
                        var obj = this.advance.attrs,
                            keys = Object.keys(obj);
                        for (var i = 0, len = keys.length; i < len; ++i) {
                            var key = keys[i],
                                val = obj[key];
                            if (key === 'class') {
                                codeClass = val;
                            } else {
                                attrs[key] = val === undefined
                                    ? true
                                    : val;
                                attrs.html5 = html5;
                            }
                        }
                        continue;
                    default:
                        break out;
                }
            }

        // text?
        if (this.peek.type === 'text') {
            buf.push("buf.push('" 
                + interpolate(this.advance.val
                    .replace(/^ /, '')
                    .replace(/'/g, "\\'")) 
                + "');");
        }

        // code?
        if (this.peek.type === 'code') {
            var tok = this.advance;
            if (tok.buffer) {
                buf.push('buf.push(' + (tok.escape
                    ? 'escape(' + tok.val + ')'
                    : tok.val) + ');');
            } else {
                buf.push(tok.val + ';');
            }
        }

        // newline*
        while (this.peek.type === 'newline') this.advance;

        // block?
        if (this.peek.type === 'indent') {
            buf.push(this.parseBlock());
        }
        
        // Build attrs
        if (hasAttrs) {
            // Classes
            if (classes.length) {
                attrs['class'] = '"' + classes.join(' ')  + '"';
            }
            if (codeClass) {
                if (attrs['class']) {
                    attrs['class'] += ' + " " + (' + codeClass + ')';
                } else {
                    attrs['class'] = codeClass;
                }
            }
            
            // Attributes
            attrBuf += "' + attrs({ ";
            var keys = Object.keys(attrs);
            for (var i = 0, len = keys.length; i < len; ++i) {
                var key = keys[i],
                    val = attrs[key];
                attrBuf += "'" + key + "': " + val + (i === len - 1 ? '' : ', ');
            }
            attrBuf += " }) + '";
        } else {
            attrBuf = '';
        }
        
        // Build the tag
        if (selfClosing.indexOf(name) >= 0) {
            return this.line + [
                "buf.push('<" + name + attrBuf + (html5 ? '' : ' /' ) + ">');",
                buf.join('\n')
            ].join('\n');
        } else {
            return this.line + [
                "buf.push('<" + name + attrBuf + ">');",
                buf.join('\n'),
                "buf.push('</" + name + ">');"
            ].join('\n');
        }
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