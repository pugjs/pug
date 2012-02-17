
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
  return str.replace(/(\\)?([#!$]){(.*?)}/g, function(str, escape, flag, code){
    function unescaped() {
        var split = code.replace(/\\'/g, "'").split('|', 2);
        code = code[0];
        var defaultVal = split.length == 2 ? split[1] : ('$' == flag ? '""' : undefined);
        var opt = (defaultVal !== undefined
            ? '("undefined" === typeof ' + code + ' ? ' + defaultVal + ' : ' + code + ')' 
            : code);
        return "' + "
            + ('!' == flag ? '' : 'escape')
            + "((interp = " + opt + ") == null ? '' : interp) + '";
    }

    return escape ? str : unescaped();
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