'use strict';

var Node = require('./node');

/**
 * Initialize a `Context` node with the given code `val`.
 *
 * @param {String} val
 * @api public
 */

var Context = module.exports = function Context(val, filename) {
  this.val = val;
  this.filename = filename;
};

/**
 * Inherit from `Node`.
 */

Context.prototype = new Node;
Context.prototype.constructor = Context;

Context.prototype.type = 'Context';
