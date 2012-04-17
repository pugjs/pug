
/*!
 * Jade - nodes - Node
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Initialize a `Node`.
 *
 * @api public
 */

var Node = module.exports = function Node(){};

Node.prototype.getType = function () {
  return this.constructor.name
      || node.constructor.toString().match(/function ([^(\s]+)()/)[1];
}