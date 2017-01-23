'use strict';

var assert = require('assert');
var walk = require('pug-walk');

function error() {
  throw require('pug-error').apply(null, arguments);
}

module.exports = link;
function link(ast) {
  assert(ast.type === 'Block', 'The top level element should always be a block');
  var extendsNode = null;
  if (ast.nodes.length) {
    var hasExtends = ast.nodes[0].type === 'Extends';
    if (hasExtends) {
      extendsNode = ast.nodes.shift();
    }
    checkExtendPosition(ast, hasExtends);
  }
  ast = applyIncludes(ast);
  ast.declaredBlocks = findDeclaredBlocks(ast);
  if (extendsNode) {
    var mixins = [];
    var expectedBlocks = [];
    ast.nodes.forEach(function addNode(node) {
      if (node.type === 'NamedBlock') {
        expectedBlocks.push(node);
      } else if (node.type === 'Block') {
        node.nodes.forEach(addNode);
      } else if (node.type === 'Mixin' && node.call === false) {
        mixins.push(node);
      } else {
        error('UNEXPECTED_NODES_IN_EXTENDING_ROOT', 'Only named blocks and mixins can appear at the top level of an extending template', node);
      }
    });
    var parent = link(extendsNode.file.ast);
    extend(parent.declaredBlocks, ast);
    var foundBlockNames = [];
    walk(parent, function (node) {
      if (node.type === 'NamedBlock') {
        foundBlockNames.push(node.name);
      }
    });
    expectedBlocks.forEach(function (expectedBlock) {
      if (foundBlockNames.indexOf(expectedBlock.name) === -1) {
        error(
          'UNEXPECTED_BLOCK',
          'Unexpected block ' + expectedBlock.name,
          expectedBlock
        );
      }
    });
    Object.keys(ast.declaredBlocks).forEach(function (name) {
      parent.declaredBlocks[name] = ast.declaredBlocks[name];
    });
    parent.nodes = mixins.concat(parent.nodes);
    return parent;
  }
  return ast;
}

function findDeclaredBlocks(ast) {
  var definitions = {};
  walk(ast, function before(node) {
    if (node.type === 'NamedBlock' && node.mode === 'replace') {
      definitions[node.name] = node;
    }
  });
  return definitions;
}
function extend(parentBlocks, ast) {
  var stack = {};
  walk(ast, function before(node) {
    if (node.type === 'NamedBlock') {
      if (stack[node.name] === node.name) {
        return node.ignore = true;
      }
      stack[node.name] = node.name;
      var parentBlock = parentBlocks[node.name];
      if (parentBlock) {
        if (parentBlock.parent) parentBlock = parentBlock.parent;
        node.parent = parentBlock;
        switch (node.mode) {
          case 'append':
            parentBlock.nodes = parentBlock.nodes.concat(node.nodes);
            break;
          case 'prepend':
            parentBlock.nodes = node.nodes.concat(parentBlock.nodes);
            break;
          case 'replace':
            parentBlock.nodes = node.nodes;
            break;
        }
      }
    }
  }, function after(node) {
    if (node.type === 'NamedBlock' && !node.ignore) {
      delete stack[node.name];
    }
  });
}
function applyIncludes(ast, child) {
  return walk(ast, function before(node, replace) {
    if (node.type === 'RawInclude') {
      replace({type: 'Text', val: node.file.str.replace(/\r/g, '')});
    }
  }, function after(node, replace) {
    if (node.type === 'Include') {
      replace(applyYield(link(node.file.ast), node.block));
    }
  });
}
function applyYield(ast, block) {
  if (!block || !block.nodes.length) return ast;
  var replaced = false;
  ast = walk(ast, null, function (node, replace) {
    if (node.type === 'YieldBlock') {
      replaced = true;
      node.type = 'Block';
      node.nodes = [block];
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
function checkExtendPosition(ast, hasExtends) {
  var legitExtendsReached = false;
  walk(ast, function (node) {
    if (node.type === 'Extends') {
      if (hasExtends && !legitExtendsReached) {
        legitExtendsReached = true;
      } else {
        error('EXTENDS_NOT_FIRST', 'Declaration of template inheritance ("extends") should be the first thing in the file.', node);
      }
    }
  });
}
