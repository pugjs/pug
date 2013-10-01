
/*!
 * Jade - nodes - Block
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Block` with an optional `node`.
 *
 * @param {Node} node
 * @api public
 */

var MixinBlock = module.exports = function MixinBlock(){};

/**
 * Inherit from `Node`.
 */


MixinBlock.prototype = Object.create(Node.prototype);
MixinBlock.prototype.constructor = MixinBlock;
MixinBlock.prototype.constructor.name = 'MixinBlock'; // prevent the minifiers removing this
