
var Node = require('./node');

var Attribute = module.exports = function Attribute(name, val) {
    Node.call(this);
    this.name = name;
    this.val = val;
};

Attribute.prototype.__proto__ = Node.prototype;