
var Node = require('./node');

var Doctype = module.exports = function Doctype(val) {
    this.val = val;
};

Doctype.prototype.__proto__ = Node.prototype;