
var Node = require('./node');

var Filter = module.exports = function Filter(name, block) {
    this.name = name;
    this.block = block;
};

Filter.prototype.__proto__ = Node.prototype;