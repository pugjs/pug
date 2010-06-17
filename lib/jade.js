
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

var fs = require('fs');

/**
 * Initialize jade parser with the given input string.
 *
 * @param {String} str
 * @api public
 */

function Parser(str){
  this.lineno = 0;
  this.input = str;
}

// TODO: handle line endings

Parser.prototype = {
  get nextToken(){
    var self = this,
        captures;
    
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
      // TODO: outdent
      return token('indent');
    }
    
    // Text
    if (captures = /^(?:\| ?)?([^\n]+)/.exec(this.input)) {
      return token('text');
    }
  }
};


var str = fs.readFileSync('examples/layout.jade', 'ascii');

var parser = new Parser(str),
    tok;

while (tok = parser.nextToken) {
  require('sys').puts(require('sys').inspect(tok));
}
