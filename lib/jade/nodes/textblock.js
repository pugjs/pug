
var Node = require('./node');

var TextBlock = module.exports = function TextBlock() {
    Node.call(this);
    this.lines = [];
};

TextBlock.prototype.addLine = function(text){
    this.lines.push(text);
};

TextBlock.prototype.__proto__ = Node.prototype;