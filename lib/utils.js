
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
    return str.replace(/(\\)?([#$!]){(.*?)}/g, function(str, escape, flag, code){
        return escape
            ? str
            : "' + "
              + ('!' == flag ? '' : 'escape')
              + "(" + code.replace(/\\'/g, "'")
              + ") + '";
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

exports.text = function(str, newline){
    return interpolate(escape(str + (newline ? '\\n' : '')));
};