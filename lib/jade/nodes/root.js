
var Node = require('./node');

var Root = module.exports = function Root() {
    Node.call(this);
};

Root.prototype.__proto__ = Node.prototype;