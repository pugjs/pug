'use strict';

var assert = require('assert');
var utils = require('./utils.js');

module.exports = link;
function link(ast, child) {
  assert(ast.type === 'Block', 'The top level element should always be a block');
  if (child) {
    ast = applyBlocks(ast, child);
  }
  if (ast.nodes[0].type === 'Extends') {
    var parent = ast.nodes[0].ast;
    var namedBlocks = {};
    for (var i = 1; i < ast.nodes.length; i++) {
      assert(ast.nodes[i].type === 'NamedBlock', 'Only named blocks can appear at the top level of an extending template');
      namedBlocks[ast.nodes[i].name] = ast.nodes[i];
    }
    return link(parent, namedBlocks);
  }
  return ast;
}

function applyBlocks(ast, child) {
  utils.walkAST(ast, function before(node) {
    
  }, function after(node) {
    if (node.type === 'NamedBlock' && child[node.name]) {
      if (child[node.name].mode === 'replace') {
        node.nodes = child[node.name].nodes;
        node.mode = 'replace';
      }
    }
  });
  return ast;
}