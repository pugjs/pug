
var Node = require('./node');

var Filter = module.exports = function Filter(name, val) {
    Node.call(this);
    this.name = name;
    this.val = val;
};

Filter.prototype.__proto__ = Node.prototype;