
var Node = require('./node');

var Code = module.exports = function Code(val, buffer) {
    Node.call(this);
    this.val = val;
    this.buffer = buffer;
};

Code.prototype.__proto__ = Node.prototype;