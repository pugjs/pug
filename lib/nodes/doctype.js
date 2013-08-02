
/*!
 * Jade - nodes - Doctype
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `Doctype` with the given `val`. 
 *
 * @param {String} val
 * @api public
 */

var Doctype = module.exports = function Doctype(val) {
  this.val = val;
};

/**
 * Inherit from `Node`.
 */

Doctype.prototype = Object.create(Node.prototype);
Doctype.prototype.constructor = Doctype;
Doctype.prototype.constructor.name = 'Doctype'; // prevent the minifiers removing this