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
  return applyIncludes(ast);
}

function applyBlocks(ast, child) {
  return utils.walkAST(ast, function before(node) {
    
  }, function after(node) {
    if (node.type === 'NamedBlock' && child[node.name]) {
      if (child[node.name].mode === 'replace') {
        node.nodes = child[node.name].nodes;
        node.mode = 'replace';
      }
    }
  });
}
function applyIncludes(ast, child) {
  return utils.walkAST(ast, function before(node) {
    
  }, function after(node, replace) {
    if (node.type === 'Include') {
      if (node.filter) {
        replace({
          type: 'Filter',
          name: node.filter,
          block: {type: 'Block', nodes: [ {type: 'Text', val: node.str.replace(/\r/g, '')} ] },
          attrs: node.attrs,
          filename: node.fullPath
        });
      } else if (node.raw) {
        replace({type: 'Text', val: node.str.replace(/\r/g, '')});
      } else {
        replace(applyYield(link(node.ast), node.block));
      }
    }
  });
}
function applyYield(ast, block) {
  if (!block || !block.nodes.length) return ast;
  var replaced = false;
  ast = utils.walkAST(ast, null, function (node, replace) {
    if (node.type === 'Block' && node.yield === true) {
      replaced = true;
      node.nodes.push(block);
    }
  });
  function defaultYieldLocation(node) {
    var res = node;
    for (var i = 0; i < node.nodes.length; i++) {
      if (node.nodes[i].textOnly) continue;
      if (node.nodes[i].type === 'Block') {
        res = defaultYieldLocation(node.nodes[i]);
      } else if (node.nodes[i].block && node.nodes[i].block.nodes.length) {
        res = defaultYieldLocation(node.nodes[i].block);
      }
    }
    return res;
  }
  if (!replaced) {
    // todo: probably should deprecate this with a warning
    defaultYieldLocation(ast).nodes.push(block);
  }
  return ast;
}
