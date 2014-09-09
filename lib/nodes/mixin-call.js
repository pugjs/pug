'use strict';

var Attrs = require('./attrs');

/**
 * Initialize a new `MixinCall` with `name`, `interp`, `args`, `selfArg` and `block`.
 *
 * @param {String} name
 * @param {Boolean} interp
 * @param {String} args
 * @param {String} selfArg
 * @param {MixinLiteral} body
 * @api public
 */

var MixinCall = module.exports = function MixinCall(name, interp, args, selfArg, body){
  Attrs.call(this);
  this.name = name;
  this.interp = interp; // if true then name is an expression from #{expression}
  this.args = args;
  this.selfArg = selfArg;
  this.body = body;
};

// Inherit from `Attrs`.
MixinCall.prototype = Object.create(Attrs.prototype);
MixinCall.prototype.constructor = MixinCall;

MixinCall.prototype.type = 'MixinCall';
