'use strict';

var Attrs = require('./attrs');

/**
 * Initialize a new `Mixin` with `name` and `body`.
 *
 * @param {String} name
 * @param {MixinLiteral} body
 * @api public
 */

var Mixin = module.exports = function Mixin(name, body){
  Attrs.call(this);
  this.name = name;
  this.body = body;
};

// Inherit from `Attrs`.
Mixin.prototype = Object.create(Attrs.prototype);
Mixin.prototype.constructor = Mixin;

Mixin.prototype.type = 'Mixin';
