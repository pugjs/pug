
/*!
 * Jade - Lexer
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Initialize `Lexer` with the given `str`.
 *
 * @param {String} str
 * @api private
 */

var Lexer = module.exports = function Lexer(str) {
    this.input = str.replace(/\r\n|\r/g, '\n').replace(/\t/g, '  ');
    this.deferredTokens = [];
    this.lastIndents = 0;
    this.lineno = 1;
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
    
    /**
     * Construct a token with the given `type` `line` and `val`.
     *
     * @param {String} type
     * @param {String} val
     * @param {Number} line
     * @return {Object}
     * @api private
     */
    
    tok: function(type, val, line){
        return {
            type: type,
            line: line === undefined ? this.lineno : line,
            val: val
        }
    },
    
    /**
     * Consume the given `len` of input.
     *
     * @param {Number} len
     * @api private
     */
    
    consume: function(len){
        this.input = this.input.substr(len);
    },

    /**
     * Single token lookahead.
     *
     * @return {Object}
     * @api private
     */
    
    get peek(){
        return this.stash = this.advance;
    },
    
    /**
     * Stashed token.
     */
    
    get stashed() {
        if (!this.stash) return;
        var tok = this.stash;
        delete this.stash;
        return tok;
    },
    
    /**
     * Deferred token.
     */
    
    get deferred() {
        if (!this.deferredTokens.length) return;
        return this.deferredTokens.shift();
    },
    
    /**
     * end-of-source.
     */
    
    get eos() {
        if (this.input.length) return;
        return this.lastIndents-- > 0
            ? this.tok('outdent')
            : this.tok('eos');
    },
    
    /**
     * Single-line comment.
     */
    
    get comment() {
        var captures;
        if (captures = /^ *\/\/(-)?([^\n]+)/.exec(this.input)) {
            this.consume(captures[0].length);
            var tok = this.tok('comment', captures[2]);
            tok.buffer = captures[1] !== '-';
            return tok;
        }
    },
    
    /**
     * Return the next token object.
     *
     * @return {Object}
     * @api private
     */
    
    get advance(){
        var self = this,
        captures;
        
        // stashed
        // deferred
        // eos
        // comment
    
        /**
        * Generate token object.
        */
    
        function token(type){
            self.input = self.input.substr(captures[0].length);
            return { 
                type: type,
                line: self.lineno,
                val: captures[1]
            };
        }
    
        // Comment
        if (captures = /^ *\/\/(-)?([^\n]+)/.exec(this.input)) {
            var tok = token('comment');
            tok.buffer = captures[1] !== '-';
            tok.val = captures[2];
            return tok;
        }
    
        // Tag
        if (captures = /^(\w[:-\w]*)/.exec(this.input)) {
            return token('tag');
        }
    
        // Filter
        if (captures = /^:(\w+)/.exec(this.input)) {
            return token('filter');
        }
    
        // Each
        if (captures = /^- *each *(\w+)(?: *, *(\w+))? * in *([^\n]+)/.exec(this.input)) {
            var tok = token('each');
            tok.val = captures[1];
            tok.key = captures[2] || 'index';
            tok.code = captures[3];
            return tok;
        }
    
        // Code
        if (captures = /^(!?=|-)([^\n]+)/.exec(this.input)) {
            var flags = captures[1];
            captures[1] = captures[2];
            var tok = token('code');
            tok.escape = flags[0] === '=';
            tok.buffer = flags[0] === '=' || flags[1] === '=';
            return tok;
        }
    
        // Doctype
        if (captures = /^!!! *(\w+)?/.exec(this.input)) {
            return token('doctype');
        }
    
        // Id
        if (captures = /^#([\w-]+)/.exec(this.input)) {
            return token('id');
        }
    
        // Class
        if (captures = /^\.([\w-]+)/.exec(this.input)) {
            return token('class');
        }
    
        // Attributes
        if (captures = /^\((.+)\)/.exec(this.input)) {
            var tok = token('attrs'),
                attrs = tok.val.split(/ *, *(?=[\w-]+ *[:=]|[\w-]+ *$)/);
            tok.attrs = {};
            for (var i = 0, len = attrs.length; i < len; ++i) {
                var pair = attrs[i];
    
                // Support = and :
                var colon = pair.indexOf(':'),
                    equal = pair.indexOf('=');
            
                // Boolean
                if (colon < 0 && equal < 0) {
                    var key = pair,
                        val = true;
                } else {
                    // Split on first = or :
                    var split = equal >= 0
                        ? equal
                        : colon;
                    if (colon >= 0 && colon < equal) split = colon;
                    var key = pair.substr(0, split),
                        val = pair.substr(++split, pair.length);
                }
                tok.attrs[key.trim().replace(/^['"]|['"]$/g, '')] = val;
            }
            return tok;
        }
    
        // Indent
        if (captures = /^\n( *)/.exec(this.input)) {
            ++this.lineno;
            var tok = token('indent'),
                indents = tok.val.length / 2;
            if (this.input[0] === '\n') {
                tok.type = 'newline';
                return tok;
            } else if (indents % 1 !== 0) {
                throw new Error('Invalid indentation, got '
                    + tok.val.length + ' space' 
                    + (tok.val.length > 1 ? 's' : '') 
                    + ', must be a multiple of two.');
            } else if (indents === this.lastIndents) {
                tok.type = 'newline';
            } else if (indents > this.lastIndents + 1) {
                throw new Error('Invalid indentation, got ' 
                    + indents + ' expected ' 
                    + (this.lastIndents + 1) + '.');
            } else if (indents < this.lastIndents) {
                var n = this.lastIndents - indents;
                tok.type = 'outdent';
                while (--n) {
                    this.deferredTokens.push({ 
                        type: 'outdent',
                        line: this.lineno
                    });
                }
            }
            this.lastIndents = indents;
            return tok;
        }
    
        // Text
        if (captures = /^(?:\| ?)?([^\n]+)/.exec(this.input)) {
            return token('text');
        }
    }
};
