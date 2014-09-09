'use strict';

var Attrs = require('./attrs');

/**
 * Initialize a new `MixinLiteral` with `args`, `block` and `noIndent`.
 *
 * @param {String} args
 * @param {Block} block
 * @param {Boolean} noIndent
 * @api public
 */

var MixinLiteral = module.exports = function MixinLiteral(args, block, noIndent){
  Attrs.call(this);
  this.args = args;
  this.block = block;
  this.noIndent = noIndent;
  this.generative = false;
};

// Inherit from `Attrs`.
MixinLiteral.prototype = Object.create(Attrs.prototype);
MixinLiteral.prototype.constructor = MixinLiteral;

MixinLiteral.prototype.type = 'MixinLiteral';
