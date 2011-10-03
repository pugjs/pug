
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

var Case = module.exports = function Case(expr){
  this.expr = expr;
  this.conditions = [];
};

/**
 * Add a `condition` with the given `block`.
 *
 * @param {String} condition
 * @param {Block} block
 * @api public
 */

Case.prototype.add = function(condition, block){
  this.conditions.push([condition, block]);
};

/**
 * Inherit from `Node`.
 */

Case.prototype.__proto__ = Node.prototype;

