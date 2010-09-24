
var Node = require('./node');

var Text = module.exports = function Text(line) {
    if ('string' == typeof line) this.push(line);
};

Text.prototype.__proto__ = Node.prototype;