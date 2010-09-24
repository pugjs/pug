
var Node = require('./node');

var Code = module.exports = function Code(val, buffer, escape) {
    this.val = val;
    this.buffer = buffer;
    this.escape = escape;
    if (/^ *else/.test(val)) this.instrumentLineNumber = false;
};

Code.prototype.__proto__ = Node.prototype;