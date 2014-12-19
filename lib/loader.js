'use strict';

var utils = require('./utils.js');

module.exports = load;
function load(ast, options) {
  if (typeof options.resolve !== 'function') {
    throw new TypeError('options.resolve must be a function');
  }
  if (typeof options.read !== 'function') {
    throw new TypeError('options.read must be a function');
  }
  if (typeof options.lex !== 'function') {
    throw new TypeError('options.lex must be a function');
  }
  if (typeof options.parse !== 'function') {
    throw new TypeError('options.parse must be a function');
  }
  // clone the ast
  ast = JSON.parse(JSON.stringify(ast));
  utils.walkAST(ast, function (node) {
    if (node.str === undefined) {
      if (node.type === 'Extends') {
        var path = options.resolve(node.path, node.filename);
        node.fullPath = path;
        var str = options.read(path);
        node.str = str;
        var tokens = options.lex(str, path);
        var ast = options.parse(tokens, path);
        node.ast = load(ast, options);
      }
      if (node.type === 'Include') {
        var path = options.resolve(node.path, node.filename);
        node.fullPath = path;
        var str = options.read(path);
        node.str = str;
        if (!node.filter && /\.jade$/.test(path)) {
          var tokens = options.lex(str, path);
          var ast = options.parse(tokens, path);
          node.ast = load(ast, options);
          node.raw = false;
        } else {
          node.raw = !node.filter;
        }
      }
    }
  });
  return ast;
}