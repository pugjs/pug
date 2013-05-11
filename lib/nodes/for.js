
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

var For = module.exports = function For(obj, val, condition, length, block) {
  this.obj = obj;
  this.val = val;
  this.condition = condition;
  this.length = length;
  this.block = block;
};

/**
 * Inherit from `Node`.
 */

For.prototype.__proto__ = Node.prototype;