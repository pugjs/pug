
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
 * @api public
 */

var Parser = exports = module.exports = function Parser(str, filename){
  this.input = str;
  this.lexer = new Lexer(str);
  this.filename = filename;
};

/**
 * Tags that may not contain tags.
 */

var textOnly = exports.textOnly = ['code', 'script', 'textarea', 'style'];

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
    var lexer = new Lexer(this.input)
      , tree = require('sys').inspect(this.parse(), false, 12, true);
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

  advance: function(){
    return this.lexer.advance();
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
    var block = new nodes.Block;
    block.line = this.line();
    while ('eos' != this.peek().type) {
      if ('newline' == this.peek().type) {
        this.advance();
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
   * | filter
   * | comment
   * | text
   * | each
   * | code
   * | id
   * | class
   */
  
  parseExpr: function(){
    switch (this.peek().type) {
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
   * code
   */
  
  parseCode: function(){
    var tok = this.expect('code')
      , node = new nodes.Code(tok.val, tok.buffer, tok.escape);
    node.line = this.line();
    if ('indent' == this.peek().type) {
      node.block = this.parseBlock();
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
      node = new nodes.BlockComment(tok.val, this.parseBlock(), tok.buffer);
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
    block = this.parseBlock();

    var node = new nodes.Filter(tok.val, block, attrs && attrs.attrs);
    node.line = this.line();
    return node;
  },
  
  /**
   * each block
   */
  
  parseEach: function(){
    var tok = this.expect('each')
      , node = new nodes.Each(tok.code, tok.val, tok.key, this.parseBlock());
    node.line = this.line();
    return node;
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
  
  parseBlock: function(){
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
      , tag = new nodes.Tag(name);

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
      tag.textOnly = true;
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
      if (type && 'text/javascript' != type.replace(/^['"]|['"]$/g, '')) {
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
        var block = this.parseBlock();
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