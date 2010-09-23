
var Node = require('./node');

var Doctype = module.exports = function Doctype(val) {
    Node.call(this);
    this.val = val;
};

Doctype.prototype.__proto__ = Node.prototype;