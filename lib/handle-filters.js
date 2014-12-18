'use strict';

var constantinople = require('constantinople');
var utils = require('./utils');

module.exports = function handleFilters(ast, filters) {
  utils.walkAST(ast, function (node) {
    if (node.type === 'Filter') {
      var text = node.block.nodes.map(
        function(node){ return node.val; }
      ).join('');
      var attrs = {};
      node.attrs.forEach(function (attr) {
        attrs[attr.name] = constantinople.toConstant(attr.val);
      });
      attrs.filename = node.filename;
      node.type = 'Text';
      node.val = filters(node.name, text, attrs);
    }
  });
  return ast;
};
