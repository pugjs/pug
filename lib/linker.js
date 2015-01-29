'use strict';

var assert = require('assert');
var walk = require('jade-walk');

module.exports = link;
function link(ast, childBlocks, childMixins) {
  assert(ast.type === 'Block', 'The top level element should always be a block');
  childBlocks = childBlocks || {};
  var extendsNode = null;
  if (ast.nodes[0].type === 'Extends') {
    extendsNode = ast.nodes.shift();
  }
  ast = applyIncludes(ast);
  ast = updateBlocks(ast, childBlocks);
  if (childMixins) {
    ast.nodes = childMixins.concat(ast.nodes);
  }
  if (extendsNode) {
    var parent = extendsNode.ast;
    var mixins = [];
    for (var i = 0; i < ast.nodes.length; i++) {
      if (ast.nodes[i].type === 'NamedBlock') {
      } else if (ast.nodes[i].type === 'Mixin' && ast.nodes[i].call === false) {
        mixins.push(ast.nodes[i]);
      } else {
        throw new Error('Only named blocks and mixins can appear at the top level of an extending template');
      }
    }
    return link(parent, childBlocks, mixins);
  }
  return ast;
}

function updateBlocks(ast, blocks) {
  blocks = blocks || {};
  var templateID = {};
  return walk(ast, null, function after(node, replace) {
    if (node.type === 'NamedBlock') {
      var name = node.name;
      var prev = blocks[name] || {
        name: name,
        type: 'NamedBlock',
        prepended: [],
        appended: [],
        id: templateID,
        mode: node.mode,
        nodes: node.nodes
      };
      if (prev.mode === 'replace') {
        if (prev.id === templateID && blocks[name]) {
          switch (node.mode) {
            case 'append':
              prev.nodes = prev.nodes.concat(node.nodes);
              break;
            case 'prepend':
              prev.nodes = node.nodes.concat(prev.nodes);
              break;
            case 'replace':
              // todo: multiple replacements in a single file will behave wierdly
              // to fix, we should be explicit about replace vs. declare
              prev = {
                name: name,
                type: 'NamedBlock',
                prepended: [],
                appended: [],
                id: templateID,
                mode: node.mode,
                nodes: node.nodes
              };
              break;
          }
        }
        return replace(blocks[name] = prev);
      }
      prev.nodes = prev.prepended.concat(node.nodes).concat(prev.appended);
      switch (node.mode) {
        case 'append':
          prev.appended = prev.id === templateID ?
                          prev.appended.concat(node.nodes) :
                          node.nodes.concat(prev.appended);
          break;
        case 'prepend':
          prev.prepended = prev.id === templateID ?
                           node.nodes.concat(prev.prepended) :
                           prev.prepended.concat(node.nodes);
          break;
        case 'replace':
          prev.id = templateID;
          break;
      }
      prev.mode = node.mode;
      return replace(blocks[name] = prev);
    }
  });
}
function applyIncludes(ast, child) {
  return walk(ast, function before(node) {

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
  ast = walk(ast, null, function (node, replace) {
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
