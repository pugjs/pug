
var Node = require('./node'),
    Block = require('./block');

var Tag = module.exports = function Tag(name) {
    this.name = name;
    this.attrs = [];
    this.block = new Block;
};

Tag.prototype.addAttribute = function(name, val){
    this.attrs.push({ name: name, val: val });
};

Tag.prototype.__proto__ = Node.prototype;