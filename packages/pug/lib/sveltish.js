'use strict';

var walk = require('pug-walk');

/**
 * "Sveltish" — Svelte-style directive attributes for pug.
 *
 * When enabled via the `sveltish` compile option, Svelte-flavored
 * attributes on tags are rewritten into equivalent plain attributes
 * that the standard code-generator already understands:
 *
 *   - `class:name={expr}`   →  `class={name: expr}`
 *       Uses pug's object-form class support, which merges with other
 *       `class` contributions on the same tag and is evaluated at
 *       render time.
 *   - `bind:attr={expr}`    →  `attr={expr}`
 *       The rendered HTML carries the evaluated value.  (True two-way
 *       binding requires a client-side layer; the marker makes the
 *       intent declarative.)
 *   - `on:event={expr}`     →  `data-on-event="<expr>"`
 *       Event handlers cannot run inside server-rendered HTML, so the
 *       directive degrades to a declarative marker attribute a
 *       hydration layer can attach listeners to — the same idea as
 *       Svelte SSR's `data-svelte-h` attributes.
 *
 * The option may be `true` (all directives) or an object
 * `{class, bind, on}` to enable subsets, e.g. `{on: false}`.
 */

/**
 * Strip one layer of braces from an attribute value source; a quoted
 * literal or bare expression is kept as-is (it is itself valid
 * expression source).
 */
function extractExpr(val) {
  if (
    val.length >= 2 &&
    val.charAt(0) === '{' &&
    val.charAt(val.length - 1) === '}'
  ) {
    return val.slice(1, -1).trim();
  }
  return val;
}

/**
 * Choose a JS string-literal source that represents `expr` without
 * breaking on embedded quotes.
 */
function quoteSource(expr) {
  if (expr.indexOf("'") === -1) {
    return "'" + expr + "'";
  }
  if (expr.indexOf('"') === -1) {
    return '"' + expr + '"';
  }
  return JSON.stringify(expr);
}

function makeRewriter(config) {
  return function rewriteAttr(attr) {
    var name = attr.name;
    var i = name.indexOf(':');
    if (i === -1) {
      return attr;
    }
    var prefix = name.slice(0, i);
    var suffix = name.slice(i + 1);

    var next;
    if (prefix === 'class' && config.class) {
      next = {
        name: 'class',
        val: '{' + suffix + ': ' + extractExpr(attr.val) + '}',
        mustEscape: false,
        line: attr.line,
        column: attr.column,
        filename: attr.filename,
      };
    } else if (prefix === 'bind' && config.bind) {
      next = {
        name: suffix,
        val: extractExpr(attr.val),
        mustEscape: true,
        line: attr.line,
        column: attr.column,
        filename: attr.filename,
      };
    } else if (prefix === 'on' && config.on) {
      next = {
        name: 'data-on-' + suffix,
        val: quoteSource(extractExpr(attr.val)),
        mustEscape: true,
        line: attr.line,
        column: attr.column,
        filename: attr.filename,
      };
    }
    if (!next) {
      return attr;
    }
    Object.keys(attr).forEach(function(key) {
      if (!(key in next)) {
        next[key] = attr[key];
      }
    });
    return next;
  };
}

/**
 * Rewrite Svelte-style directive attributes in a fully linked pug
 * AST, returning the (mutated) AST.
 */
function applySveltish(ast, sveltish) {
  var config =
    sveltish === true
      ? {class: true, bind: true, on: true}
      : {
          class: sveltish ? sveltish.class !== false : false,
          bind: sveltish ? sveltish.bind !== false : false,
          on: sveltish ? sveltish.on !== false : false,
        };
  var rewriteAttr = makeRewriter(config);
  walk(ast, function(node) {
    if (node.type === 'Tag' && node.attrs && node.attrs.length) {
      node.attrs = node.attrs.map(rewriteAttr);
    }
  });
  return ast;
}

module.exports = applySveltish;
