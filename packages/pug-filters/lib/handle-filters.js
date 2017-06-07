'use strict';

var dirname = require('path').dirname;
var constantinople = require('constantinople');
var walk = require('pug-walk');
var error = require('pug-error');
var runFilter = require('./run-filter');

module.exports = handleFilters;
function handleFilters(ast, filters, options, filterAliases) {
  options = options || {};
  walk(ast, function (node) {
    var dir = node.filename ? dirname(node.filename) : null;
    if (node.type === 'Filter') {
      handleNestedFilters(node, filters, options, filterAliases);
      var text = getBodyAsText(node);
      var attrs = getAttributes(node, options);
      attrs.filename = node.filename;
      node.type = 'Text';
      node.val = filterWithFallback(node, text, attrs);
    } else if (node.type === 'RawInclude' && node.filters.length) {
      var firstFilter = node.filters.shift();
      var attrs = getAttributes(firstFilter, options);
      var filename = attrs.filename = node.file.fullPath;
      var str = node.file.str;
      node.type = 'Text';
      node.val = filterFileWithFallback(firstFilter, filename, str, attrs);
      node.filters.forEach(function (filter) {
        var attrs = getAttributes(filter, options);
        attrs.filename = filename;
        node.val = filterWithFallback(filter, node.val, attrs);
      });
      node.filters = undefined;
      node.file = undefined;
    } else if (node.type === 'Code' && node.preFilter) {
      var attrs = { filename: node.filename };
      node.val = filterWithFallback(node, node.val, attrs);
    }

    function filterWithFallback(filter, text, attrs, funcName) {
      try {
        var filterName = getFilterName(filter);
        if (filters && filters[filterName]) {
          return filters[filterName](text, attrs);
        } else {
          return runFilter(filterName, text, attrs, dir, funcName);
        }
      } catch (ex) {
        if (ex.code === 'UNKNOWN_FILTER') {
          throw error(ex.code, ex.message, filter);
        }
        throw ex;
      }
    }

    function filterFileWithFallback(filter, filename, text, attrs) {
      var filterName = getFilterName(filter);
      if (filters && filters[filterName]) {
        return filters[filterName](text, attrs);
      } else {
        return filterWithFallback(filter, filename, attrs, 'renderFile');
      }
    }
  }, {includeDependencies: true});
  function getFilterName(filter) {
    var filterName;
    if (filter.type == 'Code') {
      filterName = filter.preFilter;
    } else {
      filterName = filter.name;
    }
    if (filterAliases && filterAliases[filterName]) {
      var filterNameAlias = filterAliases[filterName];
      if (filterAliases[filterNameAlias]) {
        throw error(
          'FILTER_ALISE_CHAIN',
          'The filter "' + filterName + '" is an alias for "' + filterNameAlias +
          '", which is an alias for "' + filterAliases[filterNameAlias] +
          '".  Pug does not support chains of filter aliases.',
          filter
        );
      }
      return filterNameAlias;
    }
    return filterName;
  }
  return ast;
};

function handleNestedFilters(node, filters, options, filterAliases) {
  if (node.block.nodes[0] && node.block.nodes[0].type === 'Filter') {
    node.block.nodes[0] = handleFilters(node.block, filters, options, filterAliases).nodes[0];
  }
}

function getBodyAsText(node) {
  return node.block.nodes.map(
    function(node){ return node.val; }
  ).join('');
}

function getAttributes(node, options) {
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
  var opts = options[node.name] || {};
  Object.keys(opts).forEach(function (opt) {
    if (!attrs.hasOwnProperty(opt)) {
      attrs[opt] = opts[opt];
    }
  });
  return attrs;
}
