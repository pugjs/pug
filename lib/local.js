
/**
 * Provide a module for compiled jade to run amok.
 *
 * NOTE: Async code within a "localized" function can have its locals
 * overridden.  Use sync code only!
 */

/**
 * Wrap a function so it takes an extra first argument, `locals`, and has these
 * available globally.
 *
 * @param {Object} sandbox
 * @api public
 */

exports.ize = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    global.__proto__ = args.shift();
    return fn.apply(global, args);
  };
}