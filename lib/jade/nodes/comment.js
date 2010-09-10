
var Node = require('./node');

var Comment = module.exports = function Comment(val, buffer) {
    Node.call(this);
    this.val = val;
    this.buffer = buffer;
};

Comment.prototype.__proto__ = Node.prototype;