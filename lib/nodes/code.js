'use strict';

var Node = require('./node');

/**
 * Initialize a `Code` node with the given code `val`.
 * Code may also be optionally buffered and escaped.
 *
 * @param {String} val
 * @param {Boolean} buffer
 * @param {Boolean} escape
 * @param {Boolean} inline
 * @api public
 */

var Code = module.exports = function Code(val, buffer, escape, inline) {
  this.val = val;
  this.buffer = buffer;
  this.escape = escape;
  this.inline = !!inline;
  if (val.match(/^ *else/)) this.debug = false;
};

// Inherit from `Node`.
Code.prototype = Object.create(Node.prototype);
Code.prototype.constructor = Code;

Code.prototype.isInline = function(){
  return this.inline;
};

Code.prototype.type = 'Code'; // prevent the minifiers removing this
