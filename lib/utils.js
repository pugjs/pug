
/*!
 * Jade - utils
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var parseJSExpression = require('character-parser').parseMax;

/**
 * Convert interpolation in the given string to JavaScript.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.interpolate = interpolate;
function interpolate(str){
  return str.replace(/(_SLASH_)?([#!]){(.*)/g, function(str, escape, flag, code){
    code = code
      .replace(/\\'/g, "'")
      .replace(/_SLASH_/g, '\\');

    if (!escape) {
      try {
        var range = parseJSExpression(code);
        return "' + "
        + ('!' == flag ? '' : 'escape')
        + "((interp = " + range.src
        + ") == null ? '' : interp) + '" + interpolate(code.substr(range.end + 1));
      } catch (ex) {
        //didn't match, just return as if escaped
      }
    }
    str = str.slice(7);
    return str.substr(0, 2) + interpolate(str.substr(2));
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
  return interpolate(escape(str)).replace(/\n/g, '\\n');
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

exports.merge = function(a, b) {
  for (var key in b) a[key] = b[key];
  return a;
};

