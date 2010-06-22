
/*!
* Jade - Language Independent Templates.
* Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
* MIT Licensed
*/

/**
* Library version.
*/

exports.version = '0.0.1';

/**
* Module dependencies.
*/

var sys = require('sys'),
    fs = require('fs');

/**
* Self closing tags.
*/

var selfClosing = exports.selfClosing = [
    'meta',
    'img',
    'link',
    'br',
    'hr',
    'input',
    'area',
    'base'
];

/**
* Default supported doctypes.
*/

var doctypes = exports.doctypes = {
    '5': '<!DOCTYPE html>',
    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
};

/**
* Initialize jade parser with the given input string.
*
* @param {String} str
* @api public
*/

function Parser(str){
    this.lineno = 1;
    this.input = str;
    this.lastIndents = 0;
    this.deferredTokens = [];
}

// TODO: handle line endings
// TODO: attrs with code...
// TODO: attrs with props...
// TODO: alternate output formats
// TODO: compression?
// TODO: xml ns
// TODO: doctypes
// TODO: auto-close
// TODO: escape / bool attrs
// TODO: bundled markdown support?
// TODO: interpolation

Parser.prototype = {
    
    /**
     * Output token stack for debugging. 
     *
     * @api private
     */
    
    debug: function(){
        var tok, width = 8;
        while (tok = parser.advance) {
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
        var self = this,
        captures;
        
        if (this.stash) {
            var tok = this.stash;
            delete this.stash;
            return tok;
        }

        if (this.deferredTokens.length) {
            return this.deferredTokens.shift();
        }

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

        // EOS
        if (!this.input.length) {
            return;
        }

        // Tag
        if (captures = /^(\w+)/.exec(this.input)) {
            return token('tag');
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

        // Id
        if (captures = /^#([\w-]+)/.exec(this.input)) {
            return token('id');
        }

        // Class
        if (captures = /^\.([\w-]+)/.exec(this.input)) {
            return token('class');
        }

        // Attributes
        if (captures = /^\[([^\]]+)\]/.exec(this.input)) {
            var tok = token('attrs'),
            attrs = tok.val.split(/ *, */);
            tok.attrs = {};
            for (var i = 0, len = attrs.length; i < len; ++i) {
                var pair = attrs[i].split(/ *= */);
                tok.attrs[pair[0]] = pair[1];
            }
            return tok;
        }

        // Indent
        if (captures = /^\n( *)/.exec(this.input)) {
            ++this.lineno;
            var tok = token('indent'),
                indents = tok.val.length / 2;
            if (indents === this.lastIndents) {
                tok.type = 'newline';
            } else if (indents > this.lastIndents + 1) {
                throw new Error('Jade(' + this.lineno + '): Invalid indentation, got ' + indents + ' expected ' + (this.lastIndents + 1));
            } else if (indents < this.lastIndents) {
                var n = this.lastIndents - indents;
                tok.type = 'outdent';
                while (--n) {
                    this.deferredTokens.push({ 
                        type: 'outdent',
                        line: this.lineno,
                        val: ''
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
    },
    
    /**
     * Single token lookahead.
     *
     * @return {Object}
     * @api private
     */
    
    get peek() {
        return this.stash = this.advance;
    },
    
    /**
     * Render input as html.
     *
     * @return {String}
     * @api private
     */
    
    render: function(){
        var buf = '';
        while (this.peek.type !== 'eos') {
            buf += this.parseExpr();
        }
        return buf;
    },
    
    /**
     *   tag
     */
    
    parseExpr: function(){
        switch (this.peek.type) {
            case 'tag':
                return this.parseTag();
                break;
        }
    },
    
    /**
     *   tag
     * | tag text
     */
    
    parseTag: function(){
        var tok = this.advance,
            buf = '<' + tok.val + '>';
        switch (this.peek.type) {
            case 'text':
                buf += this.advance.val.trim();
                break;
        }
        return buf + '</' + tok.val + '>';
    }
};

var str = fs.readFileSync('examples/layout.jade', 'ascii');

var parser = new Parser(str);
parser.debug()
//sys.puts(parser.render());
