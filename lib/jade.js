
/*!
 * Jade - Template Engine
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.2.3';

/**
 * Module dependencies.
 */

var sys = require('sys'),
    fs = require('fs');

/**
 * Intermediate JavaScript cache.
 * 
 * @type Object
 */

var cache = exports.cache = {};

/**
 * Self closing tags.
 * 
 * @type Object
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
 * 
 * @type Object
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
 * Filters.
 * 
 * @type Object
 */

var filters = exports.filters = {
    
    /**
     * Wrap text with CDATA block.
     */
    
    cdata: function(str){
        return '<![CDATA[\\n' + str + '\\n]]>';
    },
    
    /**
     * Wrap text with script and CDATA tags.
     */
    
    javascript: function(str){
        return '<script type="text/javascript">\\n//<![CDATA[\\n' + str + '\\n//]]></script>';
    },
    
    /**
     * Transform sass to css, wrapped in style tags.
     */
    
    sass: function(str){
        str = str.replace(/\\n/g, '\n');
        var sass = require('sass').render(str).replace(/\n/g, '\\n');
        return '<style>' + sass + '</style>'; 
    },
    
    /**
     * Transform sass to css, wrapped in style tags.
     */
    
    less: function(str){
        var less;
        str = str.replace(/\\n/g, '\n');
        require('less').render(str, function(err, css){
            less = '<style>' + css.replace(/\n/g, '\\n') + '</style>';  
        });
        return less;
    },
    
    /**
     * Transform markdown to html.
     */
    
    markdown: function(str){
        var md = require('markdown');
        str = str.replace(/\\n/g, '\n');
        return (md.toHTML
            ? md.toHTML(str)
            : md.parse(str)).replace(/\n/g, '\\n').replace(/'/g,'&#39;');
    }
};

/**
 * Initialize jade parser with the given input string.
 *
 * @param {String} str
 * @param {String} filename
 * @api public
 */

function Parser(str, filename){
    this.input = str.replace(/\r\n|\r/g, '\n');
    this.filename = filename;
    this.deferredTokens = [];
    this.lastIndents = 0;
    this.lineno = 1;
}

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
        if (captures = /^\( *(.+) *\)/.exec(this.input)) {
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
     * Instrument template lineno.
     *
     * @return {String}
     * @api private
     */
    
    get _() {
        return '_.lineno = ' + this.lineno + ';';
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
            case 'text':
                return "buf.push('" + interpolate(this.advance.val.replace(/'/g, "\\'")) + " ');";
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
            case 'each':
                return this.parseEach();
            case 'code':
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
            case 'newline':
                this.advance;
                return this._ + this.parseExpr();
        }
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
            return "buf.push('" + filter(text) + "');";
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
        buf.push(this._); this.expect('indent');
        while (this.peek.type !== 'outdent') {
            buf.push(this.parseExpr());
        }
        this.expect('outdent');
        return buf.join('\n');
    },
    
    /**
     * tag (attrs | class | id)* text? newline* (code | block)
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
                    .replace(/^ */, '')
                    .replace(/'/g, "\\'")) 
                + "');");
        }

        // newline*
        while (this.peek.type === 'newline') this.advance;

        // (code | block)
        switch (this.peek.type) {
            case 'code':
                var tok = this.advance;
                if (tok.buffer) {
                    buf.push('buf.push(' + (tok.escape
                        ? 'escape(' + tok.val + ')'
                        : tok.val) + ');');
                } else {
                    buf.push(tok.val + ';');
                }
                break;
            case 'indent':
                buf.push(this.parseBlock());
                break;
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
            attrBuf = "' + '";
        }
        
        // Build the tag
        if (selfClosing.indexOf(name) >= 0) {
            return [
                "buf.push('<" + name + attrBuf + (html5 ? '' : ' /' ) + ">');",
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
        html5 = obj.html5;
    delete obj.html5;
    var keys = Object.keys(obj),
        len = keys.length;
    if (len) {
        buf.push('');
        for (var i = 0; i < len; ++i) {
            var key = keys[i],
                val = obj[key];
            if (typeof val === 'boolean' || val === '' || val == null) {
                if (val) {
                    html5
                        ? buf.push(key)
                        : buf.push(key + '="' + key + '"');
                }
            } else {
                buf.push(key + '="' + escape(val) + '"');
            }
        }
    }
    return buf.join(' ');
}

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
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html){
    return String(html)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

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

/**
 * Re-throw the given `err` in context to the
 * `str` of jade, `filename`, and `lineno`.
 *
 * @param {Error} err
 * @param {String} str
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

function rethrow(err, str, filename, lineno){
    var start = lineno - 3 > 0
        ? lineno - 3
        : 0;
    // Error context
    var context = str.split('\n').slice(start, lineno).map(function(line, i){
        return '    ' + (i + start + 1) + '. ' + sys.inspect(line);
    }).join('\n');

    // Alter exception message
    err.path = filename;
    err.message = (filename || 'Jade') + ':' + lineno 
        + '\n' + context + '\n\n' + err.message;
    throw err;
}

/**
 * Parse the given `str` of jade and return a `Function`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Function}
 * @api private
 */

function parse(str, options){
    var filename = options.filename;
    try {
        var parser = new Parser(str, filename);
        if (options.debug) {
            parser.debug();
            parser = new Parser(str, filename);
        }
        var js = parser.parse();
        if (options.debug) sys.puts('\nfunction:', js.replace(/^/gm, '  '));
        try {
            return new Function('locals, attrs, escape, _', 'with (locals) {' + js + '}');
        } catch (err) {
            process.compile(js, filename || 'Jade');
            return;
        }
    } catch (err) {
        rethrow(err, str, filename, parser.lineno);
    }
}

/**
 * Render the given `str` of jade.
 *
 * Options:
 *
 *   - `scope`     Evaluation scope (`this`). Also referred to as `context`
 *   - `locals`    Local variable object
 *   - `filename`  Used in exceptions, and required by `cache`
 *   - `cache`     Cache intermediate JavaScript in memory keyed by `filename`
 *
 * @param {String|Buffer} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

exports.render = function(str, options){
    var fn,
        options = options || {},
        filename = options.filename;

    // Accept Buffers
    str = String(str);

    // Cache support
    if (options.cache) {
        if (filename) {
            if (cache[filename]) {
                fn = cache[filename];
            } else {
                fn = cache[filename] = parse(str, options);
            }
        } else {
            throw new Error('filename is required when using the cache option');
        }
    } else {
        fn = parse(str, options);
    }

    // Render the template
    try {
        options.locals = options.locals || {};
        options.locals.sys = sys;
        var _ = { lineno: 1 };
        return fn.call(options.scope || options.context, 
            options.locals,
            attrs,
            escape,
            _);
    } catch (err) {
        rethrow(err, str, filename, _.lineno);
    }
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
    if (typeof options === 'function') {
        fn = options;
        options = {};
    }
    options.filename = path;

    // Primed cache
    if (options.cache && cache[path]) {
        try {
            fn(null, exports.render('', options));
        } catch (err) {
            fn(err);
        }
    } else {
        fs.readFile(path, 'utf8', function(err, str){
            if (err) {
                fn(err);
            } else {
                try {
                    fn(null, exports.render(str, options));
                } catch (err) {
                    fn(err);
                }
            }
        });
    }
};