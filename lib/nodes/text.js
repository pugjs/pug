
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

Text.prototype.__proto__ = Node.prototype;

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
