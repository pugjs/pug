
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
    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
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

// TODO: html 5 mode... use sections vs divs? ... and selected vs selected="selected"
// TODO: handle line endings
// TODO: attrs with code...
// TODO: attrs with props...
// TODO: alternate output formats
// TODO: use process.compile() or whatever
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
        while ((tok = parser.advance).type !== 'eos') {
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
            if (this.lastIndents-- > 0) {
                return { type: 'outdent', line: this.lineno };
            } else {
                return { type: 'eos', line: this.lineno };
            }
        }

        // Tag
        if (captures = /^(\w[:\w]*)/.exec(this.input)) {
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
        if (captures = /^\(([^\)]+)\)/.exec(this.input)) {
            var tok = token('attrs'),
            attrs = tok.val.split(/ *, */);
            tok.attrs = {};
            for (var i = 0, len = attrs.length; i < len; ++i) {
                var pair = attrs[i].split(/ *[:=] */);
                tok.attrs[pair[0]] = pair[1];
            }
            return tok;
        }

        // Indent
        if (captures = /^\n( *)/.exec(this.input)) {
            ++this.lineno;
            var tok = token('indent'),
                indents = tok.val.length / 2;
            if (indents % 1 !== 0) {
                throw new Error('Jade(' + this.lineno + '): Invalid indents, got '
                    + tok.val.length + ' space' 
                    + (tok.val.length > 1 ? 's' : '') 
                    + ', must be a multiple of two.');
            } else if (indents === this.lastIndents) {
                tok.type = 'newline';
            } else if (indents > this.lastIndents + 1) {
                throw new Error('Jade(' + this.lineno + '): Invalid indentation, got ' 
                    + indents + ' expected ' 
                    + (this.lastIndents + 1));
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
     * Parse input returning a string of js for evaluation.
     *
     * @return {String}
     * @api public
     */
    
    parse: function(){
        var buf = ['var buf = [];\n'];
        while (this.peek.type !== 'eos') {
            buf.push(this.parseExpr());
        }
        buf.push("\nreturn buf.join('');");
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
            throw new Error('Jade(' + this.lineno 
                + '): expected "' + type
                + '", but got "' + this.peek.type + '"');
        }
    },
    
    /**
     *   tag
     * | id
     * | class
     * | text
     * | doctype
     * | code block?
     * | expr newline 
     */
    
    parseExpr: function(){
        switch (this.peek.type) {
            case 'tag':
                return this.parseTag();
            case 'doctype':
                return this.parseDoctype();
            case 'text':
                return "buf.push('" + this.advance.val + " ');";
            case 'id':
            case 'class':
                var tok = this.advance;
                this.deferredTokens.push({
                    val: 'div',
                    type: 'tag',
                    line: this.lineno
                });
                this.deferredTokens.push(tok);
                return this.parseExpr();
            case 'code':
                // TODO: support both
                // TODO: escape '
                var tok = this.advance;
                var buf = tok.buffer
                    ? 'buf.push(' + tok.val + ')'
                    : tok.val;
                return this.peek.type === 'indent'
                    ? buf + '\n(function(){' + this.parseBlock() + '})();'
                    : buf + ';';
            case 'newline':
                this.advance;
                return this.parseExpr();
        }
    },
    
    /**
     * doctype.
     */
    
    parseDoctype: function(){
        var tok = this.expect('doctype');
        return "buf.push('" + doctypes[tok.val || 'default'] + "');";
    },
    
    /**
     * indent expr outdent
     */
    
    parseBlock: function(){
        var buf = [];
        this.expect('indent');
        while (this.peek.type !== 'outdent') {
            buf.push(this.parseExpr());
        }
        this.expect('outdent');
        return buf.join('\n');
    },
    
    /**
     * tag (attrs | class | id)* (text | code | block)
     */
    
    parseTag: function(){
        var name = this.advance.val,
            hasAttrs = false,
            attrBuf = '',
            attrs = {},
            buf = [];
        
        // (attrs | class | id)*
        out:
            while (1) {
                switch (this.peek.type) {
                    case 'id':
                    case 'class':
                        hasAttrs = true;
                        var tok = this.advance;
                        attrs[tok.type] = attrs[tok.type]
                            ? attrs[tok.type] += ' ' + tok.val
                            : '"' + tok.val + '"';
                        continue;
                    case 'attrs':
                        hasAttrs = true;
                        var obj = this.advance.attrs,
                            keys = Object.keys(obj);
                        for (var i = 0, len = keys.length; i < len; ++i) {
                            var key = keys[i],
                                val = obj[key];

                            // Append class only
                            val = key === 'class'
                                ? attrs['class']
                                    ? attrs['class'] + ' ' + val
                                    : val
                                : val;

                            attrs[key] = val;
                        }
                        continue;
                    default:
                        break out;
                }
            }
        
        // (text | code | block)
        switch (this.peek.type) {
            case 'text':
                // TODO: escape '
                buf.push("buf.push('" + this.advance.val.trim() + "');");
                break;
            case 'code':
                // TODO: throw on non buffered code
                buf.push('buf.push(' + this.advance.val + ');');
                break;
            case 'indent':
                buf.push(this.parseBlock());
                break;
        }
        
        // Build attrs
        if (hasAttrs) {
            // TODO: escape '
            attrBuf += "' + attrs({ ";
            var keys = Object.keys(attrs);
            for (var i = 0, len = keys.length; i < len; ++i) {
                var key = keys[i],
                    val = attrs[key];
                attrBuf += key + ': ' + val + (i === len - 1 ? '' : ', ');
            }
            attrBuf += " }) + '";
        } else {
            attrBuf = "' + '";
        }
        
        // Build the tag
        if (selfClosing.indexOf(name) >= 0) {
            return [
                "buf.push('<" + name + attrBuf + " />');",
                buf.join('\n')
            ].join('\n');
        } else {
            return [
                "buf.push('<" + name + attrBuf + ">');",
                buf.join('\n'),
                "buf.push('</" + name + ">');"
            ].join('\n');
        }
    }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function attrs(obj){
    var buf = [],
        keys = Object.keys(obj),
        len = keys.length;
    if (len) {
        buf.push('');
        for (var i = 0; i < len; ++i) {
            var key = keys[i],
                val = obj[key];
            // Boolean
            if (val === undefined) {
                val = key;
            }
            buf.push(key + '="' + escape(val) + '"');
        }
    }
    return buf.join(' ');
}

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html){
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Render the given `str` of jade.
 *
 * Options:
 *
 *   - `scope`   Evaluation scope (`this`)
 *   - `locals`  Local variable object
 *
 * Examples:
 *
 *     jade.render('h1= title', {
 *         title: 'Jade rules!'
 *     });
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

exports.render = function(str, options){
    options = options || {};
    var parser = new Parser(str),
        js = parser.parse(),
        fn = Function('locals, attrs, escape', 'with (locals) {' + js + '}');
    return fn.call(options.scope, 
        options.locals || {},
        attrs,
        escape);
};

/**
 * Render jade template at the given `path`.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){
    fn = typeof options === 'function'
        ? options
        : fn;
    fs.readFile(path, 'utf8', function(err, str){
        if (err) {
            fn(err);
        } else {
            fn(null, exports.render(str, options));
        }
    });
};

var str = fs.readFileSync('examples/layout.jade', 'ascii');

var parser = new Parser(str);
parser.debug();

var parser = new Parser(str);
sys.puts(parser.parse());

sys.puts(exports.render(str));