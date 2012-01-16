(function() {

// CommonJS require()

function require(p){
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

require.modules = {};

require.resolve = function (path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

require.register = function (path, fn){
    require.modules[path] = fn;
  };

require.relative = function (parent) {
    return function(p){
      if ('.' != p[0]) return require(p);
      
      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();
      
      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };


require.register("compiler.js", function(module, exports, require){

/*!
 * Jade - Compiler
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('./nodes')
  , filters = require('./filters')
  , doctypes = require('./doctypes')
  , selfClosing = require('./self-closing')
  , inlineTags = require('./inline-tags')
  , utils = require('./utils');

 
 if (!Object.keys) {
   Object.keys = function(obj){
     var arr = [];
     for (var key in obj) {
       if (obj.hasOwnProperty(key)) {
         arr.push(key);
       }
     }
     return arr;
   } 
 }
 
 if (!String.prototype.trimLeft) {
   String.prototype.trimLeft = function(){
     return this.replace(/^\s+/, '');
   }
 }



/**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @param {Object} options
 * @api public
 */

var Compiler = module.exports = function Compiler(node, options) {
  this.options = options = options || {};
  this.node = node;
  this.hasCompiledDoctype = false;
  this.hasCompiledTag = false;
  this.pp = options.pretty || false;
  this.debug = false !== options.compileDebug;
  this.indents = 0;
  if (options.doctype) this.setDoctype(options.doctype);
};

/**
 * Compiler prototype.
 */

Compiler.prototype = {
  
  /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */
  
  compile: function(){
    this.buf = ['var interp;'];
    this.lastBufferedIdx = -1
    this.visit(this.node);
    return this.buf.join('\n');
  },

  /**
   * Sets the default doctype `name`. Sets terse mode to `true` when
   * html 5 is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {string} name
   * @api public
   */
  
  setDoctype: function(name){
    var doctype = doctypes[(name || 'default').toLowerCase()];
    doctype = doctype || '<!DOCTYPE ' + name + '>';
    this.doctype = doctype;
    this.terse = '5' == name || 'html' == name;
    this.xml = 0 == this.doctype.indexOf('<?xml');
  },
  
  /**
   * Buffer the given `str` optionally escaped.
   *
   * @param {String} str
   * @param {Boolean} esc
   * @api public
   */
  
  buffer: function(str, esc){
    if (esc) str = utils.escape(str);
    
    if (this.lastBufferedIdx == this.buf.length) {
      this.lastBuffered += str;
      this.buf[this.lastBufferedIdx - 1] = "buf.push('" + this.lastBuffered + "');"
    } else {
      this.buf.push("buf.push('" + str + "');");
      this.lastBuffered = str;
      this.lastBufferedIdx = this.buf.length;
    }    
  },
  
  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */
  
  visit: function(node){
    var debug = this.debug;

    if (debug) {
      this.buf.push('__jade.unshift({ lineno: ' + node.line
        + ', filename: ' + (node.filename
          ? '"' + node.filename + '"'
          : '__jade[0].filename')
        + ' });');
    }

    // Massive hack to fix our context
    // stack for - else[ if] etc
    if (false === node.debug && this.debug) {
      this.buf.pop();
      this.buf.pop();
    }

    this.visitNode(node);

    if (debug) this.buf.push('__jade.shift();');
  },
  
  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */
  
  visitNode: function(node){
    var name = node.constructor.name
      || node.constructor.toString().match(/function ([^(\s]+)()/)[1];
    return this['visit' + name](node);
  },

  /**
   * Visit case `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitCase: function(node){
    var _ = this.withinCase;
    this.withinCase = true;
    this.buf.push('switch (' + node.expr + '){');
    this.visit(node.block);
    this.buf.push('}');
    this.withinCase = _;
  },
  
  /**
   * Visit when `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitWhen: function(node){
    if ('default' == node.expr) {
      this.buf.push('default:');
    } else {
      this.buf.push('case ' + node.expr + ':');
    }
    this.visit(node.block);
    this.buf.push('  break;');
  },

  /**
   * Visit literal `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitLiteral: function(node){
    var str = node.str.replace(/\n/g, '\\\\n');
    this.buffer(str);
  },

  /**
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */

  visitBlock: function(block){
    var len = block.nodes.length;
    for (var i = 0; i < len; ++i) {
      this.visit(block.nodes[i]);
    }
  },
  
  /**
   * Visit `doctype`. Sets terse mode to `true` when html 5
   * is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {Doctype} doctype
   * @api public
   */
  
  visitDoctype: function(doctype){
    if (doctype && (doctype.val || !this.doctype)) {
      this.setDoctype(doctype.val || 'default');
    }

    if (this.doctype) this.buffer(this.doctype);
    this.hasCompiledDoctype = true;
  },

  /**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */

  visitMixin: function(mixin){
    var name = mixin.name.replace(/-/g, '_') + '_mixin'
      , args = mixin.args || '';

    if (mixin.block) {
      this.buf.push('var ' + name + ' = function(' + args + '){');
      this.visit(mixin.block);
      this.buf.push('}');
    } else {
      this.buf.push(name + '(' + args + ');');
    }
  },

  /**
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @api public
   */
  
  visitTag: function(tag){
    this.indents++;
    var name = tag.name;

    if (!this.hasCompiledTag) {
      if (!this.hasCompiledDoctype && 'html' == name) {
        this.visitDoctype();
      }
      this.hasCompiledTag = true;
    }

    // pretty print
    if (this.pp && inlineTags.indexOf(name) == -1) {
      this.buffer('\\n' + Array(this.indents).join('  '));
    }

    if (~selfClosing.indexOf(name) && !this.xml) {
      this.buffer('<' + name);
      this.visitAttributes(tag.attrs);
      this.terse
        ? this.buffer('>')
        : this.buffer('/>');
    } else {
      // Optimize attributes buffering
      if (tag.attrs.length) {
        this.buffer('<' + name);
        if (tag.attrs.length) this.visitAttributes(tag.attrs);
        this.buffer('>');
      } else {
        this.buffer('<' + name + '>');
      }
      if (tag.code) this.visitCode(tag.code);
      if (tag.text) this.buffer(utils.text(tag.text.nodes[0].trimLeft()));
      this.escape = 'pre' == tag.name;
      this.visit(tag.block);

      // pretty print
      if (this.pp && !~inlineTags.indexOf(name) && !tag.textOnly) {
        this.buffer('\\n' + Array(this.indents).join('  '));
      }

      this.buffer('</' + name + '>');
    }
    this.indents--;
  },
  
  /**
   * Visit `filter`, throwing when the filter does not exist.
   *
   * @param {Filter} filter
   * @api public
   */
  
  visitFilter: function(filter){
    var fn = filters[filter.name];

    // unknown filter
    if (!fn) {
      if (filter.isASTFilter) {
        throw new Error('unknown ast filter "' + filter.name + ':"');
      } else {
        throw new Error('unknown filter ":' + filter.name + '"');
      }
    }
    if (filter.isASTFilter) {
      this.buf.push(fn(filter.block, this, filter.attrs));
    } else {
      var text = filter.block.nodes.join('');
      this.buffer(utils.text(fn(text, filter.attrs)));
    }
  },
  
  /**
   * Visit `text` node.
   *
   * @param {Text} text
   * @api public
   */
  
  visitText: function(text){
    text = utils.text(text.nodes.join(''));
    if (this.escape) text = escape(text);
    this.buffer(text);
    this.buffer('\\n');
  },
  
  /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */
  
  visitComment: function(comment){
    if (!comment.buffer) return;
    if (this.pp) this.buffer('\\n' + Array(this.indents + 1).join('  '));
    this.buffer('<!--' + utils.escape(comment.val) + '-->');
  },
  
  /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */
  
  visitBlockComment: function(comment){
    if (!comment.buffer) return;
    if (0 == comment.val.trim().indexOf('if')) {
      this.buffer('<!--[' + comment.val.trim() + ']>');
      this.visit(comment.block);
      this.buffer('<![endif]-->');
    } else {
      this.buffer('<!--' + comment.val);
      this.visit(comment.block);
      this.buffer('-->');
    }
  },
  
  /**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */
  
  visitCode: function(code){
    // Wrap code blocks with {}.
    // we only wrap unbuffered code blocks ATM
    // since they are usually flow control

    // Buffer code
    if (code.buffer) {
      var val = code.val.trimLeft();
      this.buf.push('var __val__ = ' + val);
      val = 'null == __val__ ? "" : __val__';
      if (code.escape) val = 'escape(' + val + ')';
      this.buf.push("buf.push(" + val + ");");
    } else {
      this.buf.push(code.val);
    }

    // Block support
    if (code.block) {
      if (!code.buffer) this.buf.push('{');
      this.visit(code.block);
      if (!code.buffer) this.buf.push('}');
    }
  },
  
  /**
   * Visit `each` block.
   *
   * @param {Each} each
   * @api public
   */
  
  visitEach: function(each){
    this.buf.push(''
      + '// iterate ' + each.obj + '\n'
      + '(function(){\n'
      + '  if (\'number\' == typeof ' + each.obj + '.length) {\n'
      + '    for (var ' + each.key + ' = 0, $$l = ' + each.obj + '.length; ' + each.key + ' < $$l; ' + each.key + '++) {\n'
      + '      var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');

    this.visit(each.block);

    this.buf.push(''
      + '    }\n'
      + '  } else {\n'
      + '    for (var ' + each.key + ' in ' + each.obj + ') {\n'
       + '      if (' + each.obj + '.hasOwnProperty(' + each.key + ')){'
      + '      var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');

    this.visit(each.block);

     this.buf.push('      }\n');

    this.buf.push('   }\n  }\n}).call(this);\n');
  },
  
  /**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */
  
  visitAttributes: function(attrs){
    var buf = []
      , classes = [];

    if (this.terse) buf.push('terse: true');

    attrs.forEach(function(attr){
      if (attr.name == 'class') {
        classes.push('(' + attr.val + ')');
      } else {
        var pair = "'" + attr.name + "':(" + attr.val + ')';
        buf.push(pair);
      }
    });

    if (classes.length) {
      classes = classes.join(" + ' ' + ");
      buf.push("class: " + classes);
    }

    buf = buf.join(', ').replace('class:', '"class":');

    this.buf.push("buf.push(attrs({ " + buf + " }));");
  }
};

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

}); // module: compiler.js

require.register("doctypes.js", function(module, exports, require){

/*!
 * Jade - doctypes
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = {
    '5': '<!DOCTYPE html>'
  , 'xml': '<?xml version="1.0" encoding="utf-8" ?>'
  , 'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  , 'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  , 'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
  , 'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">'
  , '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
  , 'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">'
  , 'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
};
}); // module: doctypes.js

require.register("filters.js", function(module, exports, require){

/*!
 * Jade - filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = {
  
  /**
   * Wrap text with CDATA block.
   */
  
  cdata: function(str){
    return '<![CDATA[\\n' + str + '\\n]]>';
  },
  
  /**
   * Transform sass to css, wrapped in style tags.
   */
  
  sass: function(str){
    str = str.replace(/\\n/g, '\n');
    var sass = require('sass').render(str).replace(/\n/g, '\\n');
    return '<style type="text/css">' + sass + '</style>'; 
  },
  
  /**
   * Transform stylus to css, wrapped in style tags.
   */
  
  stylus: function(str, options){
    var ret;
    str = str.replace(/\\n/g, '\n');
    var stylus = require('stylus');
    stylus(str, options).render(function(err, css){
      if (err) throw err;
      ret = css.replace(/\n/g, '\\n');
    });
    return '<style type="text/css">' + ret + '</style>'; 
  },
  
  /**
   * Transform less to css, wrapped in style tags.
   */
  
  less: function(str){
    var ret;
    str = str.replace(/\\n/g, '\n');
    require('less').render(str, function(err, css){
      if (err) throw err;
      ret = '<style type="text/css">' + css.replace(/\n/g, '\\n') + '</style>';  
    });
    return ret;
  },
  
  /**
   * Transform markdown to html.
   */
  
  markdown: function(str){
    var md;

    // support markdown / discount
    try {
      md = require('markdown');
    } catch (err){
      try {
        md = require('discount');
      } catch (err) {
        try {
          md = require('markdown-js');
        } catch (err) {
          throw new Error('Cannot find markdown library, install markdown or discount');
        }
      }
    }

    str = str.replace(/\\n/g, '\n');
    return md.parse(str).replace(/\n/g, '\\n').replace(/'/g,'&#39;');
  },
  
  /**
   * Transform coffeescript to javascript.
   */

  coffeescript: function(str){
    str = str.replace(/\\n/g, '\n');
    var js = require('coffee-script').compile(str).replace(/\n/g, '\\n');
    return '<script type="text/javascript">\\n' + js + '</script>';
  }
};

}); // module: filters.js

require.register("inline-tags.js", function(module, exports, require){

/*!
 * Jade - inline tags
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = [
    'a'
  , 'abbr'
  , 'acronym'
  , 'b'
  , 'br'
  , 'code'
  , 'em'
  , 'font'
  , 'i'
  , 'img'
  , 'ins'
  , 'kbd'
  , 'map'
  , 'samp'
  , 'small'
  , 'span'
  , 'strong'
  , 'sub'
  , 'sup'
];
}); // module: inline-tags.js

require.register("jade.js", function(module, exports, require){

/*!
 * Jade
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , Lexer = require('./lexer')
  , Compiler = require('./compiler')
  , runtime = require('./runtime')

/**
 * Library version.
 */

exports.version = '0.19.0';

/**
 * Expose self closing tags.
 */

exports.selfClosing = require('./self-closing');

/**
 * Default supported doctypes.
 */

exports.doctypes = require('./doctypes');

/**
 * Text filters.
 */

exports.filters = require('./filters');

/**
 * Utilities.
 */

exports.utils = require('./utils');

/**
 * Expose `Compiler`.
 */

exports.Compiler = Compiler;

/**
 * Expose `Parser`.
 */

exports.Parser = Parser;

/**
 * Expose `Lexer`.
 */

exports.Lexer = Lexer;

/**
 * Nodes.
 */

exports.nodes = require('./nodes');

/**
 * Jade runtime helpers.
 */

exports.runtime = runtime;

/**
 * Template function cache.
 */

exports.cache = {};

/**
 * Parse the given `str` of jade and return a function body.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api private
 */

function parse(str, options){
  try {
    // Parse
    var parser = new Parser(str, options.filename, options);

    // Compile
    var compiler = new (options.compiler || Compiler)(parser.parse(), options)
      , js = compiler.compile();

    // Debug compiler
    if (options.debug) {
      console.error('\nCompiled Function:\n\n\033[90m%s\033[0m', js.replace(/^/gm, '  '));
    }

    return ''
      + 'var buf = [];\n'
      + (options.self
        ? 'var self = locals || {};\n' + js
        : 'with (locals || {}) {\n' + js + '\n}\n')
      + 'return buf.join("");';
  } catch (err) {
    parser = parser.context();
    runtime.rethrow(err, parser.filename, parser.lexer.lineno);
  }
}

/**
 * Compile a `Function` representation of the given jade `str`.
 *
 * Options:
 * 
 *   - `compileDebug` when `false` debugging code is stripped from the compiled template
 *   - `client` when `true` the helper functions `escape()` etc will reference `jade.escape()`
 *      for use with the Jade client-side runtime.js
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */

exports.compile = function(str, options){
  var options = options || {}
    , client = options.client
    , filename = options.filename
      ? JSON.stringify(options.filename)
      : 'undefined'
    , fn;

  if (options.compileDebug !== false) {
    fn = [
        'var __jade = [{ lineno: 1, filename: ' + filename + ' }];'
      , 'try {'
      , parse(String(str), options || {})
      , '} catch (err) {'
      , '  rethrow(err, __jade[0].filename, __jade[0].lineno);'
      , '}'
    ].join('\n');
  } else {
    fn = parse(String(str), options || {});
  }

  if (client) {
    fn = 'var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;\n' + fn;
  }

  fn = new Function('locals, attrs, escape, rethrow', fn);

  if (client) return fn;

  return function(locals){
    return fn(locals, runtime.attrs, runtime.escape, runtime.rethrow);
  };
};

/**
 * Render the given `str` of jade and invoke
 * the callback `fn(err, str)`.
 *
 * Options:
 *
 *   - `cache` enable template caching
 *   - `filename` filename required for `include` / `extends` and caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function} fn
 * @api public
 */

exports.render = function(str, options, fn){
  // swap args
  if ('function' == typeof options) {
    fn = options, options = {};
  }

  // cache requires .filename
  if (options.cache && !options.filename) {
    return fn(new Error('the "filename" option is required for caching'));
  }

  try {
    var path = options.filename;
    var tmpl = options.cache
      ? exports.cache[path] || (exports.cache[path] = exports.compile(str, options))
      : exports.compile(str, options);
    fn(null, tmpl(options));
  } catch (err) {
    fn(err);
  }
};

/**
 * Render a Jade file at the given `path` and callback `fn(err, str)`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){
  var key = path + ':string';

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  try {
    options.filename = path;
    var str = options.cache
      ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
      : fs.readFileSync(path, 'utf8');
    exports.render(str, options, fn);
  } catch (err) {
    fn(err);
  }
};

/**
 * Express support.
 */

exports.__express = exports.renderFile;

}); // module: jade.js

require.register("lexer.js", function(module, exports, require){

/*!
 * Jade - Lexer
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Initialize `Lexer` with the given `str`.
 *
 * Options:
 *
 *   - `colons` allow colons for attr delimiters
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Lexer = module.exports = function Lexer(str, options) {
  options = options || {};
  this.input = str.replace(/\r\n|\r/g, '\n');
  this.colons = options.colons;
  this.deferredTokens = [];
  this.lastIndents = 0;
  this.lineno = 1;
  this.stash = [];
  this.indentStack = [];
  this.indentRe = null;
  this.pipeless = false;
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
        type: type
      , line: this.lineno
      , val: val
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
    while (fetch-- > 0) this.stash.push(this.next());
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
    var str = this.input
      , nstart = 0
      , nend = 0
      , pos = 0;
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
  
  stashed: function() {
    return this.stash.length
      && this.stash.shift();
  },
  
  /**
   * Deferred token.
   */
  
  deferred: function() {
    return this.deferredTokens.length 
      && this.deferredTokens.shift();
  },
  
  /**
   * end-of-source.
   */
  
  eos: function() {
    if (this.input.length) return;
    if (this.indentStack.length) {
      this.indentStack.shift();
      return this.tok('outdent');
    } else {
      return this.tok('eos');
    }
  },

  /**
   * Comment.
   */
  
  comment: function() {
    var captures;
    if (captures = /^ *\/\/(-)?([^\n]*)/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok = this.tok('comment', captures[2]);
      tok.buffer = '-' != captures[1];
      return tok;
    }
  },
  
  /**
   * Tag.
   */
  
  tag: function() {
    var captures;
    if (captures = /^(\w[-:\w]*)/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok, name = captures[1];
      if (':' == name[name.length - 1]) {
        name = name.slice(0, -1);
        tok = this.tok('tag', name);
        this.defer(this.tok(':'));
        while (' ' == this.input[0]) this.input = this.input.substr(1);
      } else {
        tok = this.tok('tag', name);
      }
      return tok;
    }
  },
  
  /**
   * Filter.
   */
  
  filter: function() {
    return this.scan(/^:(\w+)/, 'filter');
  },
  
  /**
   * Doctype.
   */
  
  doctype: function() {
    return this.scan(/^(?:!!!|doctype) *([^\n]+)?/, 'doctype');
  },

  /**
   * Id.
   */
  
  id: function() {
    return this.scan(/^#([\w-]+)/, 'id');
  },
  
  /**
   * Class.
   */
  
  className: function() {
    return this.scan(/^\.([\w-]+)/, 'class');
  },
  
  /**
   * Text.
   */
  
  text: function() {
    return this.scan(/^(?:\| ?)?([^\n]+)/, 'text');
  },

  /**
   * Extends.
   */
  
  extends: function() {
    return this.scan(/^extends +([^\n]+)/, 'extends');
  },

  /**
   * Block prepend.
   */
  
  prepend: function() {
    var captures;
    if (captures = /^prepend +([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var mode = 'prepend'
        , name = captures[1]
        , tok = this.tok('block', name);
      tok.mode = mode;
      return tok;
    }
  },
  
  /**
   * Block append.
   */
  
  append: function() {
    var captures;
    if (captures = /^append +([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var mode = 'append'
        , name = captures[1]
        , tok = this.tok('block', name);
      tok.mode = mode;
      return tok;
    }
  },

  /**
   * Block.
   */
  
  block: function() {
    var captures;
    if (captures = /^block +(?:(prepend|append) +)?([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var mode = captures[1] || 'replace'
        , name = captures[2]
        , tok = this.tok('block', name);
      tok.mode = mode;
      return tok;
    }
  },

  /**
   * Yield.
   */
  
  yield: function() {
    return this.scan(/^yield */, 'yield');
  },

  /**
   * Include.
   */
  
  include: function() {
    return this.scan(/^include +([^\n]+)/, 'include');
  },

  /**
   * Case.
   */
  
  case: function() {
    return this.scan(/^case +([^\n]+)/, 'case');
  },

  /**
   * When.
   */
  
  when: function() {
    return this.scan(/^when +([^:\n]+)/, 'when');
  },

  /**
   * Default.
   */
  
  default: function() {
    return this.scan(/^default */, 'default');
  },

  /**
   * Assignment.
   */
  
  assignment: function() {
    var captures;
    if (captures = /^(\w+) += *([^;\n]+)( *;? *)/.exec(this.input)) {
      this.consume(captures[0].length);
      var name = captures[1]
        , val = captures[2];
      return this.tok('code', 'var ' + name + ' = (' + val + ');');
    }
  },

  /**
   * Mixin.
   */

  mixin: function(){
    var captures;
    if (captures = /^mixin +([-\w]+)(?: *\((.*)\))?/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok = this.tok('mixin', captures[1]);
      tok.args = captures[2];
      return tok;
    }
  },

  /**
   * Conditional.
   */
  
  conditional: function() {
    var captures;
    if (captures = /^(if|unless|else if|else)\b([^\n]*)/.exec(this.input)) {
      this.consume(captures[0].length);
      var type = captures[1]
        , js = captures[2];

      switch (type) {
        case 'if': js = 'if (' + js + ')'; break;
        case 'unless': js = 'if (!(' + js + '))'; break;
        case 'else if': js = 'else if (' + js + ')'; break;
        case 'else': js = 'else'; break;
      }

      return this.tok('code', js);
    }
  },

  /**
   * While.
   */
  
  while: function() {
    var captures;
    if (captures = /^while +([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      return this.tok('code', 'while (' + captures[1] + ')');
    }
  },

  /**
   * Each.
   */
  
  each: function() {
    var captures;
    if (captures = /^(?:- *)?(?:each|for) +(\w+)(?: *, *(\w+))? * in *([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok = this.tok('each', captures[1]);
      tok.key = captures[2] || '$index';
      tok.code = captures[3];
      return tok;
    }
  },
  
  /**
   * Code.
   */
  
  code: function() {
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
  
  attrs: function() {
    if ('(' == this.input[0]) {
      var index = this.indexOfDelimiters('(', ')')
        , str = this.input.substr(1, index-1)
        , tok = this.tok('attrs')
        , len = str.length
        , colons = this.colons
        , states = ['key']
        , key = ''
        , val = ''
        , quote
        , c;

      function state(){
        return states[states.length - 1];
      }

      function interpolate(attr) {
        return attr.replace(/#\{([^}]+)\}/g, function(_, expr){
          return quote + " + (" + expr + ") + " + quote;
        });
      }

      this.consume(index + 1);
      tok.attrs = {};

      function parse(c) {
        var real = c;
        // TODO: remove when people fix ":"
        if (colons && ':' == c) c = '=';
        switch (c) {
          case ',':
          case '\n':
            switch (state()) {
              case 'expr':
              case 'array':
              case 'string':
              case 'object':
                val += c;
                break;
              default:
                states.push('key');
                val = val.trim();
                key = key.trim();
                if ('' == key) return;
                tok.attrs[key.replace(/^['"]|['"]$/g, '')] = '' == val
                  ? true
                  : interpolate(val);
                key = val = '';
            }
            break;
          case '=':
            switch (state()) {
              case 'key char':
                key += real;
                break;
              case 'val':
              case 'expr':
              case 'array':
              case 'string':
              case 'object':
                val += real;
                break;
              default:
                states.push('val');
            }
            break;
          case '(':
            if ('val' == state()
              || 'expr' == state()) states.push('expr');
            val += c;
            break;
          case ')':
            if ('expr' == state()
              || 'val' == state()) states.pop();
            val += c;
            break;
          case '{':
            if ('val' == state()) states.push('object');
            val += c;
            break;
          case '}':
            if ('object' == state()) states.pop();
            val += c;
            break;
          case '[':
            if ('val' == state()) states.push('array');
            val += c;
            break;
          case ']':
            if ('array' == state()) states.pop();
            val += c;
            break;
          case '"':
          case "'":
            switch (state()) {
              case 'key':
                states.push('key char');
                break;
              case 'key char':
                states.pop();
                break;
              case 'string':
                if (c == quote) states.pop();
                val += c;
                break;
              default:
                states.push('string');
                val += c;
                quote = c;
            }
            break;
          case '':
            break;
          default:
            switch (state()) {
              case 'key':
              case 'key char':
                key += c;
                break;
              default:
                val += c;
            }
        }
      }

      for (var i = 0; i < len; ++i) {
        parse(str[i]);
      }

      parse(',');

      return tok;
    }
  },
  
  /**
   * Indent | Outdent | Newline.
   */
  
  indent: function() {
    var captures, re;

    // established regexp
    if (this.indentRe) {
      captures = this.indentRe.exec(this.input);
    // determine regexp
    } else {
      // tabs
      re = /^\n(\t*) */;
      captures = re.exec(this.input);

      // spaces
      if (captures && !captures[1].length) {
        re = /^\n( *)/;
        captures = re.exec(this.input);
      }

      // established
      if (captures && captures[1].length) this.indentRe = re;
    }

    if (captures) {
      var tok
        , indents = captures[1].length;

      ++this.lineno;
      this.consume(indents + 1);

      if (' ' == this.input[0] || '\t' == this.input[0]) {
        throw new Error('Invalid indentation, you can use tabs or spaces but not both');
      }

      // blank line
      if ('\n' == this.input[0]) return this.tok('newline');

      // outdent
      if (this.indentStack.length && indents < this.indentStack[0]) {
        while (this.indentStack.length && this.indentStack[0] > indents) {
          this.stash.push(this.tok('outdent'));
          this.indentStack.shift();
        }
        tok = this.stash.pop();
      // indent
      } else if (indents && indents != this.indentStack[0]) {
        this.indentStack.unshift(indents);
        tok = this.tok('indent', indents);
      // newline
      } else {
        tok = this.tok('newline');
      }

      return tok;
    }
  },

  /**
   * Pipe-less text consumed only when 
   * pipeless is true;
   */

  pipelessText: function() {
    if (this.pipeless) {
      if ('\n' == this.input[0]) return;
      var i = this.input.indexOf('\n');
      if (-1 == i) i = this.input.length;
      var str = this.input.substr(0, i);
      this.consume(str.length);
      return this.tok('text', str);
    }
  },

  /**
   * ':'
   */

  colon: function() {
    return this.scan(/^: */, ':');
  },

  /**
   * Return the next token object, or those
   * previously stashed by lookahead.
   *
   * @return {Object}
   * @api private
   */
  
  advance: function(){
    return this.stashed()
      || this.next();
  },
  
  /**
   * Return the next token object.
   *
   * @return {Object}
   * @api private
   */
  
  next: function() {
    return this.deferred()
      || this.eos()
      || this.pipelessText()
      || this.yield()
      || this.doctype()
      || this.case()
      || this.when()
      || this.default()
      || this.extends()
      || this.append()
      || this.prepend()
      || this.block()
      || this.include()
      || this.mixin()
      || this.conditional()
      || this.each()
      || this.while()
      || this.assignment()
      || this.tag()
      || this.filter()
      || this.code()
      || this.id()
      || this.className()
      || this.attrs()
      || this.indent()
      || this.comment()
      || this.colon()
      || this.text();
  }
};

}); // module: lexer.js

require.register("nodes/block-comment.js", function(module, exports, require){

/*!
 * Jade - nodes - BlockComment
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `BlockComment` with the given `block`.
 *
 * @param {String} val
 * @param {Block} block
 * @param {Boolean} buffer
 * @api public
 */

var BlockComment = module.exports = function BlockComment(val, block, buffer) {
  this.block = block;
  this.val = val;
  this.buffer = buffer;
};

/**
 * Inherit from `Node`.
 */

BlockComment.prototype = new Node;
BlockComment.prototype.constructor = BlockComment;

}); // module: nodes/block-comment.js

require.register("nodes/block.js", function(module, exports, require){

/*!
 * Jade - nodes - Block
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Block` with an optional `node`.
 *
 * @param {Node} node
 * @api public
 */

var Block = module.exports = function Block(node){
  this.nodes = [];
  if (node) this.push(node);
};

/**
 * Inherit from `Node`.
 */

Block.prototype = new Node;
Block.prototype.constructor = Block;


/**
 * Replace the nodes in `other` with the nodes
 * in `this` block.
 *
 * @param {Block} other
 * @api private
 */

Block.prototype.replace = function(other){
  other.nodes = this.nodes;
};

/**
 * Pust the given `node`.
 *
 * @param {Node} node
 * @return {Number}
 * @api public
 */

Block.prototype.push = function(node){
  return this.nodes.push(node);
};

/**
 * Check if this block is empty.
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.isEmpty = function(){
  return 0 == this.nodes.length;
};

/**
 * Unshift the given `node`.
 *
 * @param {Node} node
 * @return {Number}
 * @api public
 */

Block.prototype.unshift = function(node){
  return this.nodes.unshift(node);
};

/**
 * Return the "last" block, or the first `yield` node.
 *
 * @return {Block}
 * @api private
 */

Block.prototype.includeBlock = function(){
  var ret = this
    , node;

  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    node = this.nodes[i];
    if (node.yield) return node;
    else if (node.includeBlock) ret = node.includeBlock();
    else if (node.block && !node.block.isEmpty()) ret = node.block.includeBlock();
  }

  return ret;
};


}); // module: nodes/block.js

require.register("nodes/case.js", function(module, exports, require){

/*!
 * Jade - nodes - Case
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Case` with `expr`.
 *
 * @param {String} expr
 * @api public
 */

var Case = exports = module.exports = function Case(expr, block){
  this.expr = expr;
  this.block = block;
};

/**
 * Inherit from `Node`.
 */

Case.prototype = new Node;
Case.prototype.constructor = Case;


var When = exports.When = function When(expr, block){
  this.expr = expr;
  this.block = block;
  this.debug = false;
};

/**
 * Inherit from `Node`.
 */

When.prototype = new Node;
When.prototype.constructor = When;



}); // module: nodes/case.js

require.register("nodes/code.js", function(module, exports, require){

/*!
 * Jade - nodes - Code
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `Code` node with the given code `val`.
 * Code may also be optionally buffered and escaped.
 *
 * @param {String} val
 * @param {Boolean} buffer
 * @param {Boolean} escape
 * @api public
 */

var Code = module.exports = function Code(val, buffer, escape) {
  this.val = val;
  this.buffer = buffer;
  this.escape = escape;
  if (val.match(/^ *else/)) this.debug = false;
};

/**
 * Inherit from `Node`.
 */

Code.prototype = new Node;
Code.prototype.constructor = Code;

}); // module: nodes/code.js

require.register("nodes/comment.js", function(module, exports, require){

/*!
 * Jade - nodes - Comment
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `Comment` with the given `val`, optionally `buffer`,
 * otherwise the comment may render in the output.
 *
 * @param {String} val
 * @param {Boolean} buffer
 * @api public
 */

var Comment = module.exports = function Comment(val, buffer) {
  this.val = val;
  this.buffer = buffer;
};

/**
 * Inherit from `Node`.
 */

Comment.prototype = new Node;
Comment.prototype.constructor = Comment;

}); // module: nodes/comment.js

require.register("nodes/doctype.js", function(module, exports, require){

/*!
 * Jade - nodes - Doctype
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `Doctype` with the given `val`. 
 *
 * @param {String} val
 * @api public
 */

var Doctype = module.exports = function Doctype(val) {
  this.val = val;
};

/**
 * Inherit from `Node`.
 */

Doctype.prototype = new Node;
Doctype.prototype.constructor = Doctype;

}); // module: nodes/doctype.js

require.register("nodes/each.js", function(module, exports, require){

/*!
 * Jade - nodes - Each
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize an `Each` node, representing iteration
 *
 * @param {String} obj
 * @param {String} val
 * @param {String} key
 * @param {Block} block
 * @api public
 */

var Each = module.exports = function Each(obj, val, key, block) {
  this.obj = obj;
  this.val = val;
  this.key = key;
  this.block = block;
};

/**
 * Inherit from `Node`.
 */

Each.prototype = new Node;
Each.prototype.constructor = Each;

}); // module: nodes/each.js

require.register("nodes/filter.js", function(module, exports, require){

/*!
 * Jade - nodes - Filter
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , Block = require('./block');

/**
 * Initialize a `Filter` node with the given 
 * filter `name` and `block`.
 *
 * @param {String} name
 * @param {Block|Node} block
 * @api public
 */

var Filter = module.exports = function Filter(name, block, attrs) {
  this.name = name;
  this.block = block;
  this.attrs = attrs;
  this.isASTFilter = block instanceof Block;
};

/**
 * Inherit from `Node`.
 */

Filter.prototype = new Node;
Filter.prototype.constructor = Filter;

}); // module: nodes/filter.js

require.register("nodes/index.js", function(module, exports, require){

/*!
 * Jade - nodes
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

exports.Node = require('./node');
exports.Tag = require('./tag');
exports.Code = require('./code');
exports.Each = require('./each');
exports.Case = require('./case');
exports.Text = require('./text');
exports.Block = require('./block');
exports.Mixin = require('./mixin');
exports.Filter = require('./filter');
exports.Comment = require('./comment');
exports.Literal = require('./literal');
exports.BlockComment = require('./block-comment');
exports.Doctype = require('./doctype');

}); // module: nodes/index.js

require.register("nodes/literal.js", function(module, exports, require){

/*!
 * Jade - nodes - Literal
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `Literal` node with the given `str.
 *
 * @param {String} str
 * @api public
 */

var Literal = module.exports = function Literal(str) {
  this.str = str
    .replace(/\n/g, "\\n")
    .replace(/'/g, "\\'");
};

/**
 * Inherit from `Node`.
 */

Literal.prototype = new Node;
Literal.prototype.constructor = Literal;


}); // module: nodes/literal.js

require.register("nodes/mixin.js", function(module, exports, require){

/*!
 * Jade - nodes - Mixin
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Mixin` with `name` and `block`.
 *
 * @param {String} name
 * @param {String} args
 * @param {Block} block
 * @api public
 */

var Mixin = module.exports = function Mixin(name, args, block){
  this.name = name;
  this.args = args;
  this.block = block;
};

/**
 * Inherit from `Node`.
 */

Mixin.prototype = new Node;
Mixin.prototype.constructor = Mixin;



}); // module: nodes/mixin.js

require.register("nodes/node.js", function(module, exports, require){

/*!
 * Jade - nodes - Node
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Initialize a `Node`.
 *
 * @api public
 */

var Node = module.exports = function Node(){};
}); // module: nodes/node.js

require.register("nodes/tag.js", function(module, exports, require){

/*!
 * Jade - nodes - Tag
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node'),
    Block = require('./block');

/**
 * Initialize a `Tag` node with the given tag `name` and optional `block`.
 *
 * @param {String} name
 * @param {Block} block
 * @api public
 */

var Tag = module.exports = function Tag(name, block) {
  this.name = name;
  this.attrs = [];
  this.block = block || new Block;
};

/**
 * Inherit from `Node`.
 */

Tag.prototype = new Node;
Tag.prototype.constructor = Tag;


/**
 * Set attribute `name` to `val`, keep in mind these become
 * part of a raw js object literal, so to quote a value you must
 * '"quote me"', otherwise or example 'user.name' is literal JavaScript.
 *
 * @param {String} name
 * @param {String} val
 * @return {Tag} for chaining
 * @api public
 */

Tag.prototype.setAttribute = function(name, val){
  this.attrs.push({ name: name, val: val });
  return this;
};

/**
 * Remove attribute `name` when present.
 *
 * @param {String} name
 * @api public
 */

Tag.prototype.removeAttribute = function(name){
  for (var i = 0, len = this.attrs.length; i < len; ++i) {
    if (this.attrs[i] && this.attrs[i].name == name) {
      delete this.attrs[i];
    }
  }
};

/**
 * Get attribute value by `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Tag.prototype.getAttribute = function(name){
  for (var i = 0, len = this.attrs.length; i < len; ++i) {
    if (this.attrs[i] && this.attrs[i].name == name) {
      return this.attrs[i].val;
    }
  }
};

}); // module: nodes/tag.js

require.register("nodes/text.js", function(module, exports, require){

/*!
 * Jade - nodes - Text
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `Text` node with optional `line`.
 *
 * @param {String} line
 * @api public
 */

var Text = module.exports = function Text(line) {
  this.nodes = [];
  if ('string' == typeof line) this.push(line);
};

/**
 * Inherit from `Node`.
 */

Text.prototype = new Node;
Text.prototype.constructor = Text;


/**
 * Push the given `node.`
 *
 * @param {Node} node
 * @return {Number}
 * @api public
 */

Text.prototype.push = function(node){
  return this.nodes.push(node);
};

}); // module: nodes/text.js

require.register("parser.js", function(module, exports, require){

/*!
 * Jade - Parser
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer')
  , nodes = require('./nodes');

/**
 * Initialize `Parser` with the given input `str` and `filename`.
 *
 * @param {String} str
 * @param {String} filename
 * @param {Object} options
 * @api public
 */

var Parser = exports = module.exports = function Parser(str, filename, options){
  this.input = str;
  this.lexer = new Lexer(str, options);
  this.filename = filename;
  this.blocks = {};
  this.options = options;
  this.contexts = [this];
};

/**
 * Tags that may not contain tags.
 */

var textOnly = exports.textOnly = ['script', 'style'];

/**
 * Parser prototype.
 */

Parser.prototype = {

  /**
   * Push `parser` onto the context stack,
   * or pop and return a `Parser`.
   */

  context: function(parser){
    if (parser) {
      this.contexts.push(parser);
    } else {
      return this.contexts.pop();
    }
  },

  /**
   * Return the next token object.
   *
   * @return {Object}
   * @api private
   */

  advance: function(){
    return this.lexer.advance();
  },

  /**
   * Skip `n` tokens.
   *
   * @param {Number} n
   * @api private
   */

  skip: function(n){
    while (n--) this.advance();
  },
  
  /**
   * Single token lookahead.
   *
   * @return {Object}
   * @api private
   */
  
  peek: function() {
    return this.lookahead(1);
  },
  
  /**
   * Return lexer lineno.
   *
   * @return {Number}
   * @api private
   */
  
  line: function() {
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
    var block = new nodes.Block, parser;
    block.line = this.line();

    while ('eos' != this.peek().type) {
      if ('newline' == this.peek().type) {
        this.advance();
      } else {
        block.push(this.parseExpr());
      }
    }

    if (parser = this.extending) {
      this.context(parser);
      var ast = parser.parse();
      this.context();
      return ast;
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
    if (this.peek().type === type) {
      return this.advance();
    } else {
      throw new Error('expected "' + type + '", but got "' + this.peek().type + '"');
    }
  },
  
  /**
   * Accept the given `type`.
   *
   * @param {String} type
   * @api private
   */
  
  accept: function(type){
    if (this.peek().type === type) {
      return this.advance();
    }
  },
  
  /**
   *   tag
   * | doctype
   * | mixin
   * | include
   * | filter
   * | comment
   * | text
   * | each
   * | code
   * | yield
   * | id
   * | class
   */
  
  parseExpr: function(){
    switch (this.peek().type) {
      case 'tag':
        return this.parseTag();
      case 'mixin':
        return this.parseMixin();
      case 'block':
        return this.parseBlock();
      case 'case':
        return this.parseCase();
      case 'when':
        return this.parseWhen();
      case 'default':
        return this.parseDefault();
      case 'extends':
        return this.parseExtends();
      case 'include':
        return this.parseInclude();
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
      case 'yield':
        this.advance();
        var block = new nodes.Block;
        block.yield = true;
        return block;
      case 'id':
      case 'class':
        var tok = this.advance();
        this.lexer.defer(this.lexer.tok('tag', 'div'));
        this.lexer.defer(tok);
        return this.parseExpr();
      default:
        throw new Error('unexpected token "' + this.peek().type + '"');
    }
  },
  
  /**
   * Text
   */
  
  parseText: function(){
    var tok = this.expect('text')
      , node = new nodes.Text(tok.val);
    node.line = this.line();
    return node;
  },

  /**
   *   ':' expr
   * | block
   */

  parseBlockExpansion: function(){
    if (':' == this.peek().type) {
      this.advance();
      return new nodes.Block(this.parseExpr());
    } else {
      return this.block();
    }
  },

  /**
   * case
   */

  parseCase: function(){
    var val = this.expect('case').val
      , node = new nodes.Case(val);
    node.line = this.line();
    node.block = this.block();
    return node;
  },

  /**
   * when
   */

  parseWhen: function(){
    var val = this.expect('when').val
    return new nodes.Case.When(val, this.parseBlockExpansion());
  },
  
  /**
   * default
   */

  parseDefault: function(){
    this.expect('default');
    return new nodes.Case.When('default', this.parseBlockExpansion());
  },

  /**
   * code
   */
  
  parseCode: function(){
    var tok = this.expect('code')
      , node = new nodes.Code(tok.val, tok.buffer, tok.escape)
      , block
      , i = 1;
    node.line = this.line();
    while (this.lookahead(i) && 'newline' == this.lookahead(i).type) ++i;
    block = 'indent' == this.lookahead(i).type;
    if (block) {
      this.skip(i-1);
      node.block = this.block();
    }
    return node;
  },
  
  /**
   * comment
   */
  
  parseComment: function(){
    var tok = this.expect('comment')
      , node;

    if ('indent' == this.peek().type) {
      node = new nodes.BlockComment(tok.val, this.block(), tok.buffer);
    } else {
      node = new nodes.Comment(tok.val, tok.buffer);
    }

    node.line = this.line();
    return node;
  },
  
  /**
   * doctype
   */
  
  parseDoctype: function(){
    var tok = this.expect('doctype')
      , node = new nodes.Doctype(tok.val);
    node.line = this.line();
    return node;
  },
  
  /**
   * filter attrs? text-block
   */
  
  parseFilter: function(){
    var block
      , tok = this.expect('filter')
      , attrs = this.accept('attrs');

    this.lexer.pipeless = true;
    block = this.parseTextBlock();
    this.lexer.pipeless = false;

    var node = new nodes.Filter(tok.val, block, attrs && attrs.attrs);
    node.line = this.line();
    return node;
  },
  
  /**
   * tag ':' attrs? block
   */
  
  parseASTFilter: function(){
    var block
      , tok = this.expect('tag')
      , attrs = this.accept('attrs');

    this.expect(':');
    block = this.block();

    var node = new nodes.Filter(tok.val, block, attrs && attrs.attrs);
    node.line = this.line();
    return node;
  },
  
  /**
   * each block
   */
  
  parseEach: function(){
    var tok = this.expect('each')
      , node = new nodes.Each(tok.code, tok.val, tok.key);
    node.line = this.line();
    node.block = this.block();
    return node;
  },

  /**
   * 'extends' name
   */

  parseExtends: function(){
    var path = require('path')
      , fs = require('fs')
      , dirname = path.dirname
      , basename = path.basename
      , join = path.join;

    if (!this.filename)
      throw new Error('the "filename" option is required to extend templates');

    var path = this.expect('extends').val.trim()
      , dir = dirname(this.filename);

    var path = join(dir, path + '.jade')
      , str = fs.readFileSync(path, 'utf8')
      , parser = new Parser(str, path, this.options);

    parser.blocks = this.blocks;
    parser.contexts = this.contexts;
    this.extending = parser;

    // TODO: null node
    return new nodes.Literal('');
  },

  /**
   * 'block' name block
   */

  parseBlock: function(){
    var block = this.expect('block')
      , mode = block.mode
      , name = block.val.trim();

    block = 'indent' == this.peek().type
      ? this.block()
      : new nodes.Block(new nodes.Literal(''));

    var prev = this.blocks[name];

    if (prev) {
      switch (prev.mode) {
        case 'append':
          block.nodes = block.nodes.concat(prev.nodes);
          prev = block;
          break;
        case 'prepend':
          block.nodes = prev.nodes.concat(block.nodes);
          prev = block;
          break;
      }
    }

    block.mode = mode;
    return this.blocks[name] = prev || block;
  },

  /**
   * include block?
   */

  parseInclude: function(){
    var path = require('path')
      , fs = require('fs')
      , dirname = path.dirname
      , basename = path.basename
      , join = path.join;

    var path = this.expect('include').val.trim()
      , dir = dirname(this.filename);

    if (!this.filename)
      throw new Error('the "filename" option is required to use includes');

    // no extension
    if (!~basename(path).indexOf('.')) {
      path += '.jade';
    }

    // non-jade
    if ('.jade' != path.substr(-5)) {
      var path = join(dir, path)
        , str = fs.readFileSync(path, 'utf8');
      return new nodes.Literal(str);
    }

    var path = join(dir, path)
      , str = fs.readFileSync(path, 'utf8')
     , parser = new Parser(str, path, this.options);

    this.context(parser);
    var ast = parser.parse();
    this.context();
    ast.filename = path;

    if ('indent' == this.peek().type) {
      ast.includeBlock().push(this.block());
    }

    return ast;
  },

  /**
   * mixin block
   */

  parseMixin: function(){
    var tok = this.expect('mixin')
      , name = tok.val
      , args = tok.args;
    var block = 'indent' == this.peek().type
      ? this.block()
      : null;
    return new nodes.Mixin(name, args, block);
  },

  /**
   * indent (text | newline)* outdent
   */

  parseTextBlock: function(){
    var text = new nodes.Text;
    text.line = this.line();
    var spaces = this.expect('indent').val;
    if (null == this._spaces) this._spaces = spaces;
    var indent = Array(spaces - this._spaces + 1).join(' ');
    while ('outdent' != this.peek().type) {
      switch (this.peek().type) {
        case 'newline':
          text.push('\\n');
          this.advance();
          break;
        case 'indent':
          text.push('\\n');
          this.parseTextBlock().nodes.forEach(function(node){
            text.push(node);
          });
          text.push('\\n');
          break;
        default:
          text.push(indent + this.advance().val);
      }
    }

    if (spaces == this._spaces) this._spaces = null;
    this.expect('outdent');
    return text;
  },

  /**
   * indent expr* outdent
   */
  
  block: function(){
    var block = new nodes.Block;
    block.line = this.line();
    this.expect('indent');
    while ('outdent' != this.peek().type) {
      if ('newline' == this.peek().type) {
        this.advance();
      } else {
        block.push(this.parseExpr());
      }
    }
    this.expect('outdent');
    return block;
  },

  /**
   * tag (attrs | class | id)* (text | code | ':')? newline* block?
   */
  
  parseTag: function(){
    // ast-filter look-ahead
    var i = 2;
    if ('attrs' == this.lookahead(i).type) ++i;
    if (':' == this.lookahead(i).type) {
      if ('indent' == this.lookahead(++i).type) {
        return this.parseASTFilter();
      }
    }

    var name = this.advance().val
      , tag = new nodes.Tag(name)
      , dot;

    tag.line = this.line();

    // (attrs | class | id)*
    out:
      while (true) {
        switch (this.peek().type) {
          case 'id':
          case 'class':
            var tok = this.advance();
            tag.setAttribute(tok.type, "'" + tok.val + "'");
            continue;
          case 'attrs':
            var obj = this.advance().attrs
              , names = Object.keys(obj);
            for (var i = 0, len = names.length; i < len; ++i) {
              var name = names[i]
                , val = obj[name];
              tag.setAttribute(name, val);
            }
            continue;
          default:
            break out;
        }
      }

    // check immediate '.'
    if ('.' == this.peek().val) {
      dot = tag.textOnly = true;
      this.advance();
    }

    // (text | code | ':')?
    switch (this.peek().type) {
      case 'text':
        tag.text = this.parseText();
        break;
      case 'code':
        tag.code = this.parseCode();
        break;
      case ':':
        this.advance();
        tag.block = new nodes.Block;
        tag.block.push(this.parseTag());
        break;
    }

    // newline*
    while ('newline' == this.peek().type) this.advance();

    tag.textOnly = tag.textOnly || ~textOnly.indexOf(tag.name);

    // script special-case
    if ('script' == tag.name) {
      var type = tag.getAttribute('type');
      if (!dot && type && 'text/javascript' != type.replace(/^['"]|['"]$/g, '')) {
        tag.textOnly = false;
      }
    }

    // block?
    if ('indent' == this.peek().type) {
      if (tag.textOnly) {
        this.lexer.pipeless = true;
        tag.block = this.parseTextBlock();
        this.lexer.pipeless = false;
      } else {
        var block = this.block();
        if (tag.block) {
          for (var i = 0, len = block.nodes.length; i < len; ++i) {
            tag.block.push(block.nodes[i]);
          }
        } else {
          tag.block = block;
        }
      }
    }
    
    return tag;
  }
};

}); // module: parser.js

require.register("runtime.js", function(module, exports, require){

/*!
 * Jade - runtime
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Lame Array.isArray() polyfill for now.
 */

if (!Array.isArray) {
  Array.isArray = function(arr){
    return '[object Array]' == Object.prototype.toString.call(arr);
  };
}

/**
 * Lame Object.keys() polyfill for now.
 */

if (!Object.keys) {
  Object.keys = function(obj){
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  } 
}

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

exports.attrs = function attrs(obj){
  var buf = []
    , terse = obj.terse;
  delete obj.terse;
  var keys = Object.keys(obj)
    , len = keys.length;
  if (len) {
    buf.push('');
    for (var i = 0; i < len; ++i) {
      var key = keys[i]
        , val = obj[key];
      if ('boolean' == typeof val || null == val) {
        if (val) {
          terse
            ? buf.push(key)
            : buf.push(key + '="' + key + '"');
        }
      } else if ('class' == key && Array.isArray(val)) {
        buf.push(key + '="' + exports.escape(val.join(' ')) + '"');
      } else {
        buf.push(key + '="' + exports.escape(val) + '"');
      }
    }
  }
  return buf.join(' ');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno){
  if (!filename) throw err;

  var context = 3
    , str = require('fs').readFileSync(filename, 'utf8')
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context); 

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno 
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

}); // module: runtime.js

require.register("self-closing.js", function(module, exports, require){

/*!
 * Jade - self closing tags
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = [
    'meta'
  , 'img'
  , 'link'
  , 'input'
  , 'area'
  , 'base'
  , 'col'
  , 'br'
  , 'hr'
];
}); // module: self-closing.js

require.register("utils.js", function(module, exports, require){

/*!
 * Jade - utils
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Convert interpolation in the given string to JavaScript.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var interpolate = exports.interpolate = function(str){
  return str.replace(/(\\)?([#!]){(.*?)}/g, function(str, escape, flag, code){
    return escape
      ? str
      : "' + "
        + ('!' == flag ? '' : 'escape')
        + "((interp = " + code.replace(/\\'/g, "'")
        + ") == null ? '' : interp) + '";
  });
};

/**
 * Escape single quotes in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var escape = exports.escape = function(str) {
  return str.replace(/'/g, "\\'");
};

/**
 * Interpolate, and escape the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.text = function(str){
  return interpolate(escape(str));
};
}); // module: utils.js

window.jade = require("jade");
})();
