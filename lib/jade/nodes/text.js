
var Node = require('./node');

var Text = module.exports = function Text(val) {
    Node.call(this);
    this.val = val;
};

Text.prototype.__proto__ = Node.prototype;