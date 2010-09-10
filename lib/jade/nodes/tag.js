
var Node = require('./node'),
    Block = require('./block');

var Tag = module.exports = function Tag(name) {
    Node.call(this);
    this.name = name;
    this.attrs = [];
    this.block = new Block;
};

Tag.prototype.addAttribute = function(attr){
    this.attrs.push(attr);
};

Tag.prototype.__proto__ = Node.prototype;