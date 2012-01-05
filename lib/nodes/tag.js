/*!
 * Jade - nodes - Tag
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node'),
    Block = require('./block');

/**
 * Initialize a `Tag` node with the given tag `name` and optional `block`.
 *
 * @param {String} name
 * @param {Block} block
 * @api public
 */

var Tag = module.exports = function Tag(name, block) {
  this.name = name;
  this.attrs = [];
  this.attrs.ix = {}; //map of indexes by attr name
  this.block = block || new Block;
};

/**
 * Inherit from `Node`.
 */

Tag.prototype.__proto__ = Node.prototype;

/**
 * Set attribute `name` to `val`, keep in mind these become
 * part of a raw js object literal, so to quote a value you must
 * '"quote me"', otherwise or example 'user.name' is literal JavaScript.
 *
 * @param {String} name
 * @param {String} val
 * @return {Tag} for chaining
 * @api public
 */

Tag.prototype.setAttribute = function(name, val){
  ( this.attrs.ix[name]          //exists?
    ? this.attrs.ix[name]        // - use it
    : this.attrs.ix[name] = []   // orelse - init & use returned value of assignment
  ).push( this.attrs.push({ name: name, val: val }) - 1 );
  return this;
};

/**
 * Remove attribute `name` when present.
 *
 * @param {String} name
 * @return {Tag} for chaining
 * @api public
 */

Tag.prototype.removeAttribute = function(name){
  var arix = this.attrs.ix[name]; 
  if (!arix) return;
  delete this.attrs.ix[name];
  arix.forEach(function(ix){
    delete this.attrs[ix]; 
  });
  return this;
};

/**
 * Get attribute value by `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Tag.prototype.getAttribute = function(name){
  var attr = this.attrs
    , arix = attr.ix[name]
    ;
  //TODO: how should we handle a case an attribute is pushed several times?
  if (arix) 
      return attr[ arix[0] ]; 
      //Alternatives - return a single value or array of values? 
      // return (arix = arix.map(function(ix){ return attr[ix]})).lenhth > 1 ? arix : arix[0];
      //                                    or CSV as arix.join(",") ??
      // return arix.map(function(ix){ return attr[ix]}).join(",")
};
