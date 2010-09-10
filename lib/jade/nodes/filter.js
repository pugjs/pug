
var Node = require('./node');

var Filter = module.exports = function Filter(name, textBlock) {
    Node.call(this);
    this.name = name;
    this.textBlock = textBlock;
};

Filter.prototype.__proto__ = Node.prototype;