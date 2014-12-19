'use strict';

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

exports.merge = function(a, b) {
  for (var key in b) a[key] = b[key];
  return a;
};

exports.stringify = function(str) {
  return JSON.stringify(str)
             .replace(/\u2028/g, '\\u2028')
             .replace(/\u2029/g, '\\u2029');
};

exports.walkAST = function walkAST(ast, before, after) {
  function replace(replacement) {
    ast = replacement;
  }
  before && before(ast, replace);
  switch (ast.type) {
    case 'NamedBlock':
    case 'Block':
      ast.nodes = ast.nodes.map(function (node) {
        return walkAST(node, before, after);
      });
      break;
    case 'Case':
    case 'Each':
    case 'Mixin':
    case 'Tag':
    case 'When':
    case 'Code':
      if (ast.block) {
        ast.block = walkAST(ast.block, before, after);
      }
      break;
    case 'Extends':
    case 'Include':
      if (ast.ast) {
        ast.ast = walkAST(ast.ast, before, after);
      }
      break;
    case 'Attrs':
    case 'BlockComment':
    case 'Comment':
    case 'Doctype':
    case 'Filter':
    case 'Literal':
    case 'MixinBlock':
    case 'Text':
      break;
    default:
      throw new Error('Unexpected node type ' + ast.type);
      break;
  }
  after && after(ast, replace);
  return ast;
};
