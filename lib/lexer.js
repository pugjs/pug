
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
    this.stash = [];
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
    
    /**
     * Construct a token with the given `type` and `val`.
     *
     * @param {String} type
     * @param {String} val
     * @return {Object}
     * @api private
     */
    
    tok: function(type, val){
        return {
            type: type,
            line: this.lineno,
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
     * Scan for `type` with the given `regexp`.
     *
     * @param {String} type
     * @param {RegExp} regexp
     * @return {Object}
     * @api private
     */
    
    scan: function(regexp, type){
        var captures;
        if (captures = regexp.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok(type, captures[1]);
        }
    },
    
    /**
     * Defer the given `tok`.
     *
     * @param {Object} tok
     * @api private
     */
    
    defer: function(tok){
        this.deferredTokens.push(tok);
    },
    
    /**
     * Lookahead `n` tokens.
     *
     * @param {Number} n
     * @return {Object}
     * @api private
     */
    
    lookahead: function(n){
        var fetch = n - this.stash.length;
        while (fetch-- > 0) this.stash.push(this.next);
        return this.stash[--n];
    },
    
    /**
     * Return the indexOf `start` / `end` delimiters.
     *
     * @param {String} start
     * @param {String} end
     * @return {Number}
     * @api private
     */
    
    indexOfDelimiters: function(start, end){
        var str = this.input,
            nstart = 0,
            nend = 0,
            pos = 0;
        for (var i = 0, len = str.length; i < len; ++i) {
          if (start == str[i]) {
              ++nstart;
          } else if (end == str[i]) {
            if (++nend == nstart) {
              pos = i;
              break;
            }
          }
        }
        return pos;
    },
    
    /**
     * Stashed token.
     */
    
    get stashed() {
        return this.stash.length
            && this.stash.shift();
    },
    
    /**
     * Deferred token.
     */
    
    get deferred() {
        return this.deferredTokens.length 
            && this.deferredTokens.shift();
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
     * Comment.
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
     * Tag.
     */
    
    get tag() {
        return this.scan(/^(\w[-:\w]*)/, 'tag');
    },
    
    /**
     * Filter.
     */
    
    get filter() {
        return this.scan(/^:(\w+)/, 'filter');
    },
    
    /**
     * Doctype.
     */
    
    get doctype() {
        return this.scan(/^!!! *(\w+)?/, 'doctype');
    },
    
    /**
     * Id.
     */
    
    get id() {
        return this.scan(/^#([\w-]+)/, 'id');
    },
    
    /**
     * Class.
     */
    
    get className() {
        return this.scan(/^\.([\w-]+)/, 'class');
    },
    
    /**
     * Text.
     */
    
    get text() {
        return this.scan(/^(?:\| ?)?([^\n]+)/, 'text');
    },

    /**
     * Each.
     */
    
    get each() {
        var captures;
        if (captures = /^- *each *(\w+)(?: *, *(\w+))? * in *([^\n]+)/.exec(this.input)) {
            this.consume(captures[0].length);
            var tok = this.tok('each', captures[1]);
            tok.key = captures[2] || 'index';
            tok.code = captures[3];
            return tok;
        }
    },
    
    /**
     * Code.
     */
    
    get code() {
        var captures;
        if (captures = /^(!?=|-)([^\n]+)/.exec(this.input)) {
            this.consume(captures[0].length);
            var flags = captures[1];
            captures[1] = captures[2];
            var tok = this.tok('code', captures[1]);
            tok.escape = flags[0] === '=';
            tok.buffer = flags[0] === '=' || flags[1] === '=';
            return tok;
        }
    },
    
    /**
     * Attributes.
     */
    
    get attrs() {
        if ('(' == this.input[0]) {
            var index = this.indexOfDelimiters('(', ')'),
                str = this.input.substr(1, index-1);
            this.consume(index + 1);
            var tok = this.tok('attrs', str),
                attrs = tok.val.split(/ *, *(?=['"\w-]+ *[:=]|[\w-]+ *$)/);
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
    },
    
    /**
     * Indent.
     */
    
    get indent() {
        var captures;
        if (captures = /^\n( *)/.exec(this.input)) {
            ++this.lineno;
            this.consume(captures[0].length);
            var tok = this.tok('indent', captures[1]),
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
                    this.defer(this.tok('outdent'));
                }
            }
            this.lastIndents = indents;
            return tok;
        }
    },
    
    /**
     * Return the next token object, or those
     * previously stashed by lookahead.
     *
     * @return {Object}
     * @api private
     */
    
    get advance(){
        return this.stashed
            || this.next;
    },
    
    /**
     * Return the next token object.
     *
     * @return {Object}
     * @api private
     */
    
    get next() {
        return this.deferred
            || this.eos
            || this.tag
            || this.filter
            || this.each
            || this.code
            || this.doctype
            || this.id
            || this.className
            || this.attrs
            || this.indent
            || this.comment
            || this.text;
    }
};
