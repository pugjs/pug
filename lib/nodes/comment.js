
var Node = require('./node');

var Comment = module.exports = function Comment(val, buffer) {
    this.val = val;
    this.buffer = buffer;
};

Comment.prototype.__proto__ = Node.prototype;