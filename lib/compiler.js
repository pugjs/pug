
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
  , utils = require('./utils');

// if browser
// 
// if (!Object.keys) {
//   Object.keys = function(obj){
//     var arr = [];
//     for (var key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         arr.push(obj);
//       }
//     }
//     return arr;
//   } 
// }
// 
// if (!String.prototype.trimLeft) {
//   String.prototype.trimLeft = function(){
//     return this.replace(/^\s+/, '');
//   }
// }
//
// end


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
    var doctype = doctypes[name || 'default'];
    if (!doctype) throw new Error('unknown doctype "' + name + '"');
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
    this.buf.push("buf.push('" + str + "');");
  },
  
  /**
   * Buffer the given `node`'s lineno.
   *
   * @param {Node} node
   * @api public
   */
  
  line: function(node){
    if (node.instrumentLineNumber === false) return;
    this.buf.push('__.lineno = ' + node.line + ';');
  },
  
  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */
  
  visit: function(node){
    this.line(node);
    return this.visitNode(node);
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
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */

  visitBlock: function(block){
    var len = len = block.nodes.length;
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
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @api public
   */
  
  visitTag: function(tag){
    var name = tag.name;

    if (!this.hasCompiledTag) {
      if (!this.hasCompiledDoctype && 'html' == name) {
        this.visitDoctype();
      }
      this.hasCompiledTag = true;
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
      this.buffer('</' + name + '>');
    }
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
    this.buffer('<!--' + utils.escape(comment.val) + '-->');
  },
  
  /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */
  
  visitBlockComment: function(comment){
    if (0 == comment.val.indexOf('if')) {
      this.buffer('<!--[' + comment.val + ']>');
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
      // if browser
      // + '      if (' + each.obj + '.hasOwnProperty(' + each.key + ')){'
      // end
      + '      var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');

    this.visit(each.block);

    // if browser
    // this.buf.push('      }\n');
    // end

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
