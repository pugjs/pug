
var Node = require('./node');

var Text = module.exports = function Text(line) {
    Node.call(this);
    this.lines = [];
    if (typeof line === 'string') {
        this.addLine(line);
    }
};

Text.prototype.addLine = function(line){
    this.lines.push(line);
};

Text.prototype.__proto__ = Node.prototype;