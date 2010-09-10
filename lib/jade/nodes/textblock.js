
var Node = require('./node');

var TextBlock = module.exports = function TextBlock() {
    Node.call(this);
    this.lines = [];
};

TextBlock.prototype.addLine = function(str){
    this.lines.push(str);
};

TextBlock.prototype.__proto__ = Node.prototype;