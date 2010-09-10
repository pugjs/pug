
var Node = require('./node');

var Filter = module.exports = function Filter(name, text) {
    Node.call(this);
    this.name = name;
    this.text = text;
};

Filter.prototype.__proto__ = Node.prototype;