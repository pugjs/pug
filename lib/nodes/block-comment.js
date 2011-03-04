
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
 * @api public
 */

var BlockComment = module.exports = function BlockComment(val, block) {
  this.block = block;
  this.val = val;
};

/**
 * Inherit from `Node`.
 */

BlockComment.prototype.__proto__ = Node.prototype;