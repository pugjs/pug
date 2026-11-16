'use strict';

var makeError = require('pug-error');

function evalExpression(str, name, node) {
  var value;
  try {
    // eslint-disable-next-line no-new-func
    value = new Function('return (' + str + ');')();
  } catch (ex) {
    throw makeError(
      'BUILTIN_FILTER_EVAL',
      'failed to evaluate :' +
        name +
        ' filter block as a JavaScript expression: ' +
        ex.message,
      node || {line: 0, column: 0}
    );
  }
  return value;
}

function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function attrString(attrs) {
  if (!attrs) {
    return '';
  }
  var out = '';
  Object.keys(attrs).forEach(function(key) {
    var value = attrs[key];
    if (value === null || value === undefined || value === false) {
      return;
    }
    if (value === true) {
      out += ' ' + key;
    } else {
      out += ' ' + key + '="' + escape(value) + '"';
    }
  });
  return out;
}

/**
 * Serialize a single element named `name` holding `value`.
 *
 * `depth` is the indentation level of the element's own opening tag.
 * Children are indented one level deeper.
 */
function elementXML(name, value, depth) {
  var indent = '\n' + new Array(depth + 1).join('  ');
  var open = indent + '<' + name;
  if (value === null || value === undefined) {
    return open + ' />';
  }
  if (Array.isArray(value)) {
    var items = value.map(function(item) {
      return elementXML('item', item, depth + 1);
    });
    return open + '>' + items.join('') + indent + '</' + name + '>';
  }
  if (typeof value === 'object') {
    var children = Object.keys(value).map(function(key) {
      return elementXML(key, value[key], depth + 1);
    });
    return open + '>' + children.join('') + indent + '</' + name + '>';
  }
  return open + '>' + escape(value) + '</' + name + '>';
}

/**
 * :json filter — the block must be a JavaScript expression; the
 * evaluated value is serialized to JSON.
 *
 *   :json()
 *     { foo: 'bar', n: 1 }
 */
function jsonFilter(str, options, node) {
  var value = evalExpression(str, 'json', node);
  var indent =
    options && options.indent !== undefined ? options.indent : undefined;
  return JSON.stringify(value, null, indent);
}

/**
 * :xml filter — the block must be a JavaScript expression; the
 * evaluated value is serialized to well-formed XML.
 *
 * Objects become nested elements, arrays become repeated `<item>`
 * elements, `null` / `undefined` values become self-closing elements,
 * and everything else becomes escaped text.  The whole result is
 * wrapped in a root element whose name comes from the `root` option
 * (default `"root"`).
 *
 *   :xml(root="user")
 *     { name: "O'Brien", tags: ['a<b', 'c&d'], score: null }
 *
 *   <user>
 *     <name>O&apos;Brien</name>
 *     <tags>
 *       <item>a&lt;b</item>
 *       <item>c&amp;d</item>
 *     </tags>
 *     <score />
 *   </user>
 */
function xmlFilter(str, options, node) {
  var value = evalExpression(str, 'xml', node);
  options = options || {};
  var rootName = options.root || 'root';
  var attrText = attrString(options.attrs);

  if (value === null || value === undefined) {
    return '<' + rootName + attrText + ' />';
  }

  if (Array.isArray(value)) {
    var items = value.map(function(item) {
      return elementXML('item', item, 1);
    });
    return (
      '<' + rootName + attrText + '>' + items.join('') + '\n</' + rootName + '>'
    );
  }
  if (typeof value === 'object') {
    var children = Object.keys(value).map(function(key) {
      return elementXML(key, value[key], 1);
    });
    return (
      '<' +
      rootName +
      attrText +
      '>' +
      children.join('') +
      '\n</' +
      rootName +
      '>'
    );
  }
  return (
    '<' + rootName + attrText + '>' + escape(value) + '</' + rootName + '>'
  );
}

module.exports = {
  json: jsonFilter,
  xml: xmlFilter,
};
