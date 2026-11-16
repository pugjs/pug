'use strict';

var walk = require('pug-walk');

/**
 * "Sveltish" — modern Svelte-style attributes for pug.
 *
 * When enabled via the `sveltish` compile option, Svelte-flavored
 * attributes on tags are rewritten into equivalent plain attributes
 * that the standard code-generator already understands:
 *
 *   - `class:name=expr`   →  `class={name: expr}`
 *       Uses pug's object-form class support, which merges with other
 *       `class` contributions on the same tag and is evaluated at
 *       render time.
 *   - `bind:attr=expr`    →  `attr=expr`
 *       The rendered HTML carries the evaluated value.  (True two-way
 *       binding requires a client-side layer; the marker makes the
 *       intent declarative.)
 *   - `on<event>=expr`    →  `data-on-<event>="<expr>"`
 *       e.g. `onclick=save` → `data-on-click="save"`.  Modern Svelte
 *       (v4/v5) dropped the `on:` directive in favor of plain DOM
 *       event attributes, so a bare `on*` attribute is treated as a
 *       handler directive.  Event handlers cannot run inside
 *       server-rendered HTML, so the directive degrades to a
 *       declarative marker attribute a hydration layer can attach
 *       listeners to — the same idea as Svelte SSR's `data-svelte-h`
 *       attributes.
 *
 * Values are bare pug expressions (pug's `=` values already evaluate).
 * A surrounding `{...}` layer is tolerated as legacy Svelte sugar and
 * stripped, but is not recommended: the lexer additionally requires
 * brace-wrapped values to parse as a valid JS expression, which
 * restricts what can go inside (e.g. embedded string quotes).
 *
 * The option may be `true` (all directives) or an object
 * `{class, bind, on}` to enable subsets, e.g. `{on: false}`, where
 * `on` controls the bare `on*` event attributes.
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
 * Extract handler source from a bare `on*` attribute value: strip one
 * layer of legacy `{...}` sugar, then strip matching outer quotes so
 * that `onclick="doIt()"` and `onclick=doIt` both yield `doIt()`.
 */
function handlerSource(val) {
  val = extractExpr(val);
  var q = val.charAt(0);
  if (
    val.length >= 2 &&
    (q === '"' || q === "'") &&
    val.charAt(val.length - 1) === q
  ) {
    val = val.slice(1, -1);
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

    var rewrite = null;
    if (i === -1 && /^on[a-z]/.test(name) && config.on) {
      // bare DOM event attribute (modern Svelte form)
      rewrite = {
        name: 'data-on-' + name.slice(2),
        val: quoteSource(handlerSource(attr.val)),
        mustEscape: true,
      };
    } else if (i !== -1) {
      var prefix = name.slice(0, i);
      var suffix = name.slice(i + 1);
      if (prefix === 'class' && config.class) {
        rewrite = {
          name: 'class',
          val: '{' + suffix + ': ' + extractExpr(attr.val) + '}',
          mustEscape: false,
        };
      } else if (prefix === 'bind' && config.bind) {
        rewrite = {
          name: suffix,
          val: extractExpr(attr.val),
          mustEscape: true,
        };
      }
    }

    if (!rewrite) {
      return attr;
    }
    var next = {};
    Object.keys(attr).forEach(function(key) {
      next[key] = attr[key];
    });
    Object.assign(next, rewrite);
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
