
var Node = require('./node');

var Root = module.exports = function Root(block) {
    this.block = block;
};

Root.prototype.__proto__ = Node.prototype;