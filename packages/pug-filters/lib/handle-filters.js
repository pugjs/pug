'use strict';

var dirname = require('path').dirname;
var constantinople = require('constantinople');
var walk = require('pug-walk');
var error = require('pug-error');
var runFilter = require('./run-filter');

module.exports = handleFilters;
function handleFilters(ast, filters, options) {
  options = options || {};
  walk(ast, function (node) {
    var dir = node.filename ? dirname(node.filename) : null;
    if (node.type === 'Filter') {
      handleNestedFilters(node, filters);
      var text = getBodyAsText(node);
      var attrs = getAttributes(node);
      var opts = options[node.name] || {};
      Object.keys(opts).forEach(function (opt) {
        if (!attrs.hasOwnProperty(opt)) {
          attrs[opt] = opts[opt];
        }
      });
      attrs.filename = node.filename;
      node.type = 'Text';
      node.val = filterWithFallback(node, text, attrs);
    } else if (node.type === 'RawInclude' && node.filters.length) {
      var firstFilter = node.filters.shift();
      var attrs = getAttributes(firstFilter);
      var filename = attrs.filename = node.file.fullPath;
      var str = node.file.str;
      node.type = 'Text';
      node.val = filterFileWithFallback(firstFilter, filename, str, attrs);
      node.filters.forEach(function (filter) {
        var attrs = getAttributes(filter);
        attrs.filename = filename;
        node.val = filterWithFallback(filter, node.val, attrs);
      });
      node.filters = undefined;
      node.file = undefined;
    }

    function filterWithFallback(filter, text, attrs, funcName) {
      try {
        if (filters && filters[filter.name]) {
          return filters[filter.name](text, attrs);
        } else {
          return runFilter(filter.name, text, attrs, dir, funcName);
        }
      } catch (ex) {
        if (ex.code === 'UNKNOWN_FILTER') {
          throw error(ex.code, ex.message, filter);
        }
        throw ex;
      }
    }

    function filterFileWithFallback(filter, filename, text, attrs) {
      if (filters && filters[filter.name]) {
        return filters[filter.name](text, attrs);
      } else {
        return filterWithFallback(filter, filename, attrs, 'renderFile');
      }
    }
  }, {includeDependencies: true});
  return ast;
};

function handleNestedFilters(node, filters) {
  if (node.block.nodes[0] && node.block.nodes[0].type === 'Filter') {
    node.block.nodes[0] = handleFilters(node.block, filters).nodes[0];
  }
}

function getBodyAsText(node) {
  return node.block.nodes.map(
    function(node){ return node.val; }
  ).join('');
}

function getAttributes(node) {
  var attrs = {};
  node.attrs.forEach(function (attr) {
    try {
      attrs[attr.name] = constantinople.toConstant(attr.val);
    } catch (ex) {
      if (/not constant/.test(ex.message)) {
        throw error('FILTER_OPTION_NOT_CONSTANT', ex.message + ' All filters are rendered compile-time so filter options must be constants.', node);
      }
      throw ex;
    }
  });
  return attrs;
}
