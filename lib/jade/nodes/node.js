
var Node = module.exports = function Node() {
    this.children = [];
};

Node.prototype.push = function(child){
    this.children.push(child);
    return this;
};
