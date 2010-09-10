
var Node = require('./node');

var Tag = module.exports = function Tag(name) {
    Node.call(this);
    this.name = name;
    this.attrs = [];
};

Tag.prototype.addAttribute = function(attr){
    this.attrs.push(attr);
};

Tag.prototype.__proto__ = Node.prototype;