
/*!
 * Jade - utils
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Convert interpolation in the given string to JavaScript.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var interpolate = exports.interpolate = function(str){
  return str.replace(/(\\)?([#!]){(.*?)}/g, function(str, escape, flag, code){
    return escape
      ? str
      : "' + "
        + ('!' == flag ? '' : 'escape')
        + "((interp = " + code.replace(/\\'/g, "'")
        + ") == null ? '' : interp) + '";
  });
};

/**
 * Escape single quotes in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var escape = exports.escape = function(str) {
  return str.replace(/'/g, "\\'");
};

/**
 * Interpolate, and escape the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.text = function(str){
  return interpolate(escape(str));
};


/**
 * Interpolate a single mixin, assignment, tag, or attribute argument
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
var interpolate_string = exports.interpolate_string = function(str, quote){
  if(!str) return str;
  quote = quote || /['"]/.exec(str);
  return str.replace(/#\{([^}]+)\}/g, function(_, expr){
    return quote[0] + " + (" + expr + ") + " + quote[0];
  });
};