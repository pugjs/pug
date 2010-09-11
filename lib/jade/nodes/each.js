
var Node = require('./node');

var Each = module.exports = function Each(obj, val, key, block) {
    Node.call(this);
    this.obj = obj;
    this.val = val;
    this.key = key;
    this.block = block;
};

Each.prototype.__proto__ = Node.prototype;