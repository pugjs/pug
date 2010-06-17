
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
  this.lineno = 0;
  this.input = str;
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
  debug: function(){
    var tok, width = 8;
    while (tok = parser.nextToken) {
      var type = tok.type,
          pad = width - type.length;
      while (pad--) {
        type += ' ';
      }
      sys.puts(tok.line 
        + ' : \x1B[1m' + type + '\x1B[0m' 
        + ' ' + sys.inspect(tok.val)
        + (tok.attrs ? ' ' + sys.inspect(tok.attrs) : ''));
    }
  },
  
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

var parser = new Parser(str);
parser.debug();
