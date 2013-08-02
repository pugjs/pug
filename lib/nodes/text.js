
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
  this.val = '';
  if ('string' == typeof line) this.val = line;
};

/**
 * Inherit from `Node`.
 */

Text.prototype = Object.create(Node.prototype);
Text.prototype.constructor = Text;
Text.prototype.constructor.name = 'Text'; // prevent the minifiers removing this

/**
 * Flag as text.
 */

Text.prototype.isText = true;