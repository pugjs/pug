
/*!
 * Jade - Compiler
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @api private
 */

var Compiler = module.exports = function Compiler(node) {
    console.dir(node)
};

/**
 * Dummy iteration template.
 */

var iterate = (function(){
    var __vals = __obj__;
    if (__vals instanceof Array) {
        for (var i = 0, len = __vals.length; i < len; ++i) {
            var __key__ = i;
            var __val__ = __vals[i];
            __block__
        }
    } else if (typeof __vals === 'object') {
        var keys = Object.keys(__vals);
        for (var i = 0, len = keys.length; i < len; ++i) {
            var __key__ = keys[i];
            var __val__ = __vals[__key__];
            __block__
        }
    } else {
        var __val__ = __vals;
        __block__
    }
}).toString();

/**
 * Convert interpolation in the given string to JavaScript.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function interpolate(str){
    return str.replace(/(\\)?[#$]{(.*?)}/g, function(str, escape, code){
        return escape
            ? str
            : "' + (" + code.replace(/\\'/g, "'") + ") + '";
    });
}