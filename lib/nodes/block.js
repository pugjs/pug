
var Node = require('./node');

var Block = module.exports = function Block() {
    this.nodes = [];
};

Block.prototype.push = function(node){
    this.nodes.push(node);
};


Block.prototype.__proto__ = Node.prototype;