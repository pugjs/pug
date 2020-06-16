'use strict';

var doctypes = require('doctypes');
var makeError = require('pug-error');
var buildRuntime = require('pug-runtime/build');
var runtime = require('pug-runtime');
var compileAttrs = require('pug-attrs');
var selfClosing = require('void-elements');
var constantinople = require('constantinople');
var stringify = require('js-stringify');

var findGlobals = require('with/lib/globals.js').default;

var t = require('@babel/types');
var gen = require('@babel/generator');
var babylon = require('@babel/parser');
var babelTemplate = require('@babel/template').default;
var babel = require('@babel/core');

// This is used to prevent pretty printing inside certain tags
var WHITE_SPACE_SENSITIVE_TAGS = {
  pre: true,
  textarea: true,
};

var INTERNAL_VARIABLES = [
  'pug',
  'pug_mixins',
  'pug_interp',
  'pug_debug_filename',
  'pug_debug_line',
  'pug_debug_sources',
  'pug_html',
];

var push = Array.prototype.push;
var unshift = Array.prototype.unshift;
var concat = Array.prototype.concat;

var tpl_json_interp = JSON.stringify(
  babelTemplate.ast(`null == (pug_interp = VALUE) ? "" : pug_interp`)
);

var tpl_json_interp_escape = JSON.stringify(
  babelTemplate.ast(`escape(null == (pug_interp = VALUE) ? "" : pug_interp)`)
);

var tpl_json_buffer = JSON.stringify(
  babelTemplate.ast(`pug_html = pug_html + placeholder`)
);

module.exports = generateCode;
module.exports.CodeGenerator = Compiler;
function generateCode(ast, options) {
  return new Compiler(ast, options).compile();
}

function isConstant(src) {
  return constantinople(src, {pug: runtime, pug_interp: undefined});
}
function toConstant(src) {
  return constantinople.toConstant(src, {pug: runtime, pug_interp: undefined});
}

/**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @param {Object} options
 * @api public
 */

function Compiler(node, options) {
  this.options = options = options || {};
  this.node = node;
  this.hasCompiledDoctype = false;
  this.hasCompiledTag = false;
  this.pp = options.pretty || false;
  if (this.pp && typeof this.pp !== 'string') {
    this.pp = '  ';
  }
  this.debug = false !== options.compileDebug;
  this.indents = 0;
  this.parentIndents = 0;
  this.terse = false;
  this.mixins = {};
  this.dynamicMixins = false;
  this.eachCount = 0;
  if (options.doctype) this.setDoctype(options.doctype);
  this.runtimeFunctionsUsed = [];
  this.inlineRuntimeFunctions = options.inlineRuntimeFunctions || false;
  if (this.debug && this.inlineRuntimeFunctions) {
    this.runtimeFunctionsUsed.push('rethrow');
  }
  this.codeBuffer = 'plug=function*(){';
  this.codeMarker = {};
  this.codeIndex = -1;

  this.useGenerators = false;
  this.templateVars = ['locals'];
}

/**
 * Compiler prototype.
 */

Compiler.prototype = {
  runtime: function(name, asAST) {
    if (this.inlineRuntimeFunctions) {
      this.runtimeFunctionsUsed.push(name);
      return asAST ? t.identifier('pug_' + name) : 'pug_' + name;
    } else {
      return asAST
        ? t.memberExpression(t.identifier('pug'), t.identifier(name))
        : 'pug.' + name;
    }
  },

  error: function(message, code, node) {
    var err = makeError(code, message, {
      line: node.line,
      column: node.column,
      filename: node.filename,
    });
    throw err;
  },

  parseExpr: function(expr) {
    //return babylon.parse('function*g(){return e='+expr+'}').program.body[0].body.body[0].argument.right;
    return babylon.parseExpression(expr);
  },
  parseArgs: function(args) {
    return babylon.parse('a(' + args + ')').program.body.pop().expression
      .arguments;
  },
  ast_variableDeclaration: function() {
    return t.variableDeclaration('var', [
      t.variableDeclarator(t.identifier('pug_html'), t.stringLiteral('')),
      t.variableDeclarator(t.identifier('pug_mixins'), t.objectExpression([])),
      t.variableDeclarator(t.identifier('pug_interp'), null),
    ]);
  },
  ast_return: function() {
    return [t.returnStatement(t.identifier('pug_html'))];
  },
  wrapCallExpression: function(node) {
    return node;
  },
  ast_buffer: function(ast) {
    const o = JSON.parse(tpl_json_buffer);
    o.expression.right.right = ast;
    return o;
  },
  ast_with: function(ast) {
    let exclude = this.options.globals
      ? this.options.globals.concat(INTERNAL_VARIABLES)
      : INTERNAL_VARIABLES;
    exclude = exclude.concat(
      this.runtimeFunctionsUsed.map(function(name) {
        return 'pug_' + name;
      })
    );
    exclude.push('undefined', 'this', 'locals');
    let vars = findGlobals(t.program(ast))
      .map(function(v) {
        return v.name;
      })
      .filter(function(v) {
        return exclude.indexOf(v) === -1;
      });
    if (vars.length > 0) {
      let bag = 'locals';
      ast = [
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.functionExpression(
                null,
                vars.map(function(v) {
                  return t.identifier(v);
                }),
                t.blockStatement(ast)
              ),
              t.identifier('call')
            ),
            [t.thisExpression()].concat(
              vars.map(function(v) {
                return t.conditionalExpression(
                  t.binaryExpression(
                    'in',
                    t.stringLiteral(v),
                    t.logicalExpression(
                      '||',
                      t.identifier(bag),
                      t.objectExpression([])
                    )
                  ),
                  t.memberExpression(
                    t.logicalExpression(
                      '||',
                      t.identifier(bag),
                      t.objectExpression([])
                    ),
                    t.identifier(v)
                  ),
                  t.conditionalExpression(
                    t.binaryExpression(
                      '!==',
                      t.unaryExpression('typeof', t.identifier(v)),
                      t.stringLiteral('undefined')
                    ),
                    t.identifier(v),
                    t.identifier('undefined')
                  )
                );
              })
            )
          )
        ),
      ];
    }
    return ast;
  },
  /**
   * This method is called once the AST is built in
   * order to apply transformations
   * nb: a custom AST walk/replace was written because
   * the babel plugin architecture
   * Currently it this transformation :
   *  - compacts sequential pug_html = pug_html + any (max of 100)
   *  - further compacts sequential pug_html = pug_html + stringLiteral
   */

  ast_postprocess: function(ast) {
    let needCompaction = function(c) {
      return (
        t.isExpressionStatement(c) &&
        t.isAssignmentExpression(c.expression) &&
        c.expression.left.name === 'pug_html' &&
        t.isBinaryExpression(c.expression.right) &&
        c.expression.right.left.name === 'pug_html'
      );
    };

    let walk = function(node) {
      Object.keys(node).forEach(function(k) {
        var child = node[k];
        if (child && typeof child === 'object' && child.length) {
          child.forEach(function(c) {
            if (c && typeof c.type === 'string') {
              walk(c);
            }
          });
          let i, j;
          for (i = 0; i < child.length; i++) {
            let start, end;
            let fragment = [t.identifier('pug_html')];
            if (needCompaction(child[i])) {
              start = i;
              end = i;
              // locate sequential buffer operations
              while (
                needCompaction(child[end]) &&
                end < child.length &&
                fragment.length < 101
              ) {
                fragment.push(child[end].expression.right.right);
                end++;
              }

              // join adjacent stringLiterals
              for (j = 0; j < fragment.length; j++) {
                let start, end;
                if (t.isStringLiteral(fragment[j])) {
                  start = j;
                  end = j;
                  while (
                    t.isStringLiteral(fragment[end]) &&
                    end < fragment.length
                  ) {
                    end++;
                  }
                  let lit = t.stringLiteral(
                    fragment
                      .slice(start, end)
                      .map(function(v) {
                        return v.value;
                      })
                      .join('')
                  );
                  //lit.extra = {rawValue: lit.value, raw: stringify(lit.value)};
                  fragment.splice(start, end - start, lit);
                }
              }

              // join fragments
              let expr = t.expressionStatement(
                t.assignmentExpression(
                  '=',
                  t.identifier('pug_html'),
                  fragment.reduce(function(acc, val) {
                    return t.binaryExpression('+', acc, val);
                  })
                )
              );
              child.splice(start, end - start, expr);
            }
          }
        } else if (child && typeof child.type === 'string') {
          walk(child);
        }
      });
    };
    walk(ast);
    return ast;
  },
  /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */

  compile: function() {
    var ast = [];
    if (this.pp) {
      ast.push(
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('pug_indent'), t.arrayExpression()),
        ])
      );
    }

    push.apply(ast, this.visit(this.node));

    if (!this.dynamicMixins) {
      // if there are no dynamic mixins we can remove any un-used mixins
      var mixinNames = Object.keys(this.mixins);
      for (var i = 0; i < mixinNames.length; i++) {
        var mixin = this.mixins[mixinNames[i]];
        if (!mixin.used) {
          for (var x = 0; x < mixin.instances.length; x++) {
            mixin.instances[x].stmt.type = 'EmptyStatement';
            delete mixin.instances[x].stmt.expression;
          }
        }
      }
    }

    if (this.options.self) {
      ast = [
        t.variableDeclaration('var', [
          t.variableDeclarator(
            t.identifier('self'),
            t.logicalExpression(
              '||',
              t.identifier('locals'),
              t.objectExpression([])
            )
          ),
        ]),
      ].concat(ast);
    } else {
      // transform `ast` into `with(locals || {}) { ast }`
      ast = this.ast_with(ast);
    }

    if (this.debug) {
      if (this.options.includeSources) {
        ast.unshift(
          t.variableDeclaration('var', [
            t.variableDeclarator(
              t.identifier('pug_debug_sources'),
              this.parseExpr(stringify(this.options.includeSources))
            ),
          ])
        );
      }

      var rethrowArgs = [
        t.identifier('err'),
        t.identifier('pug_debug_filename'),
        t.identifier('pug_debug_line'),
      ];
      if (this.options.includeSources) {
        rethrowArgs.push(
          t.memberExpression(
            t.identifier('pug_debug_sources'),
            t.identifier('pug_debug_filename'),
            true
          )
        );
      }
      ast = [
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('pug_debug_filename'), null),
          t.variableDeclarator(t.identifier('pug_debug_line'), null),
        ]),
        t.tryStatement(
          t.blockStatement(ast),
          t.catchClause(
            t.identifier('err'),
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(
                  this.inlineRuntimeFunctions
                    ? t.identifier('pug_rethrow')
                    : t.memberExpression(
                        t.identifier('pug'),
                        t.identifier('rethrow')
                      ),
                  rethrowArgs
                )
              ),
            ])
          )
        ),
      ];
    }

    ast = t.functionDeclaration(
      t.identifier(this.options.templateName || 'template'),
      this.templateVars.map(function(v) {
        return t.identifier(v);
      }),
      t.blockStatement(
        [this.ast_variableDeclaration()].concat(ast, this.ast_return())
      )
    );

    ast = this.ast_postprocess(ast);

    return (
      buildRuntime(this.runtimeFunctionsUsed) +
      gen.default(ast, {compact: true, jsescOption: {isScriptContext: true}})
        .code
    );
  },

  /**
   * Sets the default doctype `name`. Sets terse mode to `true` when
   * html 5 is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {string} name
   * @api public
   */

  setDoctype: function(name) {
    this.doctype = doctypes[name.toLowerCase()] || '<!DOCTYPE ' + name + '>';
    this.terse = this.doctype.toLowerCase() == '<!doctype html>';
    this.xml = 0 == this.doctype.indexOf('<?xml');
  },

  /**
   * Buffer the given `str` exactly as is or with interpolation
   *
   * @param {String} str
   * @param {Boolean} interpolate
   * @api public
   */

  buffer: function(str) {
    const lit = t.stringLiteral(str);
    //lit.extra = {rawValue: lit.value, raw: stringify(lit.value)};
    return this.ast_buffer(lit);
  },

  /**
   * Buffer the given `src` so it is evaluated at run time
   *
   * @param {String} src
   * @api public
   */

  bufferExpression: function(src) {
    if (isConstant(src)) {
      return this.buffer(toConstant(src) + '');
    }
    var body = this.parseExpr(src);
    var ast = this.ast_buffer(body);
    return ast;
  },

  bufferAST: function(ast) {
    return this.ast_buffer(ast);
  },

  /**
   * Buffer an indent based on the current `indent`
   * property and an additional `offset`.
   *
   * @param {Number} offset
   * @param {Boolean} newline
   * @api public
   */

  prettyIndent: function(offset, newline) {
    var ast;
    offset = offset || 0;
    newline = newline ? '\n' : '';
    ast = concat.apply(
      [],
      [
        this.buffer(newline + Array(this.indents + offset).join(this.pp)),
        this.parentIndents
          ? this.ast_buffer(
              t.callExpression(
                t.memberExpression(
                  t.identifier('pug_indent'),
                  t.identifier('join')
                ),
                [t.stringLiteral('')]
              )
            )
          : [],
      ]
    );
    return ast;
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visitCacheLine: JSON.stringify(babelTemplate.ast(`pug_debug_line = 1;`)),
  visitCacheFilename: JSON.stringify(
    babelTemplate.ast(`pug_debug_filename = "";`)
  ),
  visit: function(node, parent) {
    var ast = [];
    var debug = this.debug;
    if (!node) {
      var msg;
      if (parent) {
        msg =
          'A child of ' +
          parent.type +
          ' (' +
          (parent.filename || 'Pug') +
          ':' +
          parent.line +
          ')';
      } else {
        msg = 'A top-level node';
      }
      msg += ' is ' + node + ', expected a Pug AST Node.';
      throw new TypeError(msg);
    }

    if (debug && node.debug !== false && node.type !== 'Block') {
      if (node.line) {
        const astLine = JSON.parse(this.visitCacheLine);
        astLine.expression.right.value = node.line;
        astLine.expression.right.extra = null;
        ast.push(astLine);

        if (node.filename) {
          const astFile = JSON.parse(this.visitCacheFilename);
          astFile.expression.right.value = node.filename;
          astFile.expression.right.extra = null;
          ast.push(astFile);
        }
      }
    }

    if (!this['visit' + node.type]) {
      var msg;
      if (parent) {
        msg = 'A child of ' + parent.type;
      } else {
        msg = 'A top-level node';
      }
      msg +=
        ' (' +
        (node.filename || 'Pug') +
        ':' +
        node.line +
        ')' +
        ' is of type ' +
        node.type +
        ',' +
        ' which is not supported by pug-code-gen.';
      switch (node.type) {
        case 'Filter':
          msg += ' Please use pug-filters to preprocess this AST.';
          break;
        case 'Extends':
        case 'Include':
        case 'NamedBlock':
        case 'FileReference': // unlikely but for the sake of completeness
          msg += ' Please use pug-linker to preprocess this AST.';
          break;
      }
      throw new TypeError(msg);
    }

    const res = this.visitNode(node, parent);
    unshift.apply(res, ast);
    return res;
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visitNode: function(node, parent) {
    //console.log('visit', node.type)
    return this['visit' + node.type](node, parent);
  },

  /**
   * Visit case `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitCase: function(node) {
    var stmt = t.switchStatement(
      node.astExpr || this.parseExpr(node.expr),
      this.visit(node.block, node)
    );
    return [stmt];
  },

  /**
   * Visit when `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitWhen: function(node) {
    var test = null;
    if ('default' != node.expr) {
      test = node.astExpr || this.parseExpr(node.expr);
    }
    var consequent = [];
    if (node.block) {
      consequent = this.visit(node.block, node);
      consequent.push(t.breakStatement());
    }
    var c = t.switchCase(test, consequent);
    return [c];
  },

  /**
   * Visit literal `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitLiteral: function(node) {
    return this.buffer(node.str);
  },

  visitNamedBlock: function(block) {
    return this.visitBlock(block);
  },
  /**
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */

  visitBlock: function(block) {
    var escapePrettyMode = this.escapePrettyMode;
    var pp = this.pp;
    var ast = [];
    // Pretty print multi-line text
    if (
      pp &&
      block.nodes.length > 1 &&
      !escapePrettyMode &&
      block.nodes[0].type === 'Text' &&
      block.nodes[1].type === 'Text'
    ) {
      push.apply(ast, this.prettyIndent(1, true));
    }
    //console.log('start block')
    const blocks = Array(2 * block.nodes.length);
    for (var i = 0; i < block.nodes.length; ++i) {
      // Pretty print text
      blocks[2 * i] = [];
      if (
        pp &&
        i > 0 &&
        !escapePrettyMode &&
        block.nodes[i].type === 'Text' &&
        block.nodes[i - 1].type === 'Text' &&
        /\n$/.test(block.nodes[i - 1].val)
      ) {
        blocks[2 * i] = this.prettyIndent(1, false);
      }
      const b = this.visit(block.nodes[i], block);
      blocks[2 * i + 1] = b;
    }
    ast = ast.concat.apply(ast, blocks);
    return ast;
  },

  /**
   * Visit a mixin's `block` keyword.
   *
   * @param {MixinBlock} block
   * @api public
   */

  visitMixinBlock: function(block) {
    var ast = [];
    if (this.pp) {
      ast.push(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(
              t.identifier('pug_indent'),
              t.identifier('push')
            ),
            [t.stringLiteral(Array(this.indents + 1).join(this.pp))]
          )
        )
      );
    }
    ast.push(
      t.expressionStatement(
        t.logicalExpression(
          '&&',
          t.identifier('block'),
          this.wrapCallExpression(t.callExpression(t.identifier('block'), []))
        )
      )
    );
    if (this.pp) {
      ast.push(
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(t.identifier('pug_indent'), t.identifier('pop')),
            []
          )
        )
      );
    }
    return ast;
  },

  /**
   * Visit `doctype`. Sets terse mode to `true` when html 5
   * is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {Doctype} doctype
   * @api public
   */

  visitDoctype: function(doctype) {
    var ast = [];
    if (doctype && (doctype.val || !this.doctype)) {
      this.setDoctype(doctype.val || 'html');
    }

    if (this.doctype) ast = [this.buffer(this.doctype)];
    this.hasCompiledDoctype = true;
    return ast;
  },

  /**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */

  visitMixin: function(mixin) {
    var ast = [];
    var self = this;
    var name = 'pug_mixins[';
    var args = mixin.args || '';
    var block = mixin.block;
    var attrs = mixin.attrs;
    var attrsBlocks = this.attributeBlocks(mixin.attributeBlocks);
    var pp = this.pp;
    var dynamic = mixin.name[0] === '#';
    var key = mixin.name;
    if (dynamic) this.dynamicMixins = true;
    name +=
      (dynamic
        ? mixin.name.substr(2, mixin.name.length - 3)
        : '"' + mixin.name + '"') + ']';
    var mixinName = dynamic
      ? mixin.astName ||
        this.parseExpr(mixin.name.substr(2, mixin.name.length - 3))
      : t.stringLiteral(mixin.name);
    this.mixins[key] = this.mixins[key] || {used: false, instances: []};

    // mixin invocation
    if (mixin.call) {
      this.mixins[key].used = true;
      if (pp) {
        ast.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier('pug_indent'),
                t.identifier('push')
              ),
              [t.stringLiteral(Array(this.indents + 1).join(pp))]
            )
          )
        );
      }
      if (block || attrs.length || attrsBlocks.length) {
        var astArgs = [];
        ast.push(
          t.expressionStatement(
            this.wrapCallExpression(
              t.callExpression(
                t.memberExpression(
                  t.memberExpression(
                    t.identifier('pug_mixins'),
                    mixinName,
                    true
                  ),
                  t.identifier('call')
                ),
                astArgs
              )
            )
          )
        );

        var astObj, astKey;
        if (block || attrsBlocks.length || attrs.length) {
          astKey = [];
          astObj = t.objectExpression(astKey);
          astArgs.push(astObj);
        }

        if (block) {
          var astFunc = [];

          // Render block with no indents, dynamically added when rendered
          this.parentIndents++;
          var _indents = this.indents;
          this.indents = 0;
          push.apply(astFunc, this.visit(mixin.block, mixin));
          this.indents = _indents;
          this.parentIndents--;

          astKey.push(
            t.objectProperty(
              t.identifier('block'),
              t.functionExpression(
                null,
                [],
                t.blockStatement(astFunc),
                this.useGenerators
              )
            )
          );
        }

        if (attrsBlocks.length) {
          if (attrs.length) {
            var val = this.attrs(attrs);
            attrsBlocks.unshift(val);
          }
          if (attrsBlocks.length > 1) {
            astKey.push(
              t.objectProperty(
                t.identifier('attributes'),
                t.callExpression(
                  this.runtime('merge', true),
                  attrsBlocks.map(function(b) {
                    return self.parseExpr(b);
                  })
                )
              )
            );
          } else {
            astKey.push(
              t.objectProperty(
                t.identifier('attributes'),
                this.parseExpr(attrsBlocks[0])
              )
            );
          }
        } else if (attrs.length) {
          var val = this.attrs(attrs);
          astKey.push(
            t.objectProperty(t.identifier('attributes'), this.parseExpr(val))
          );
        }

        if (args) {
          args = args ? args.split(',') : [];
          Array.prototype.push.apply(
            astArgs,
            mixin.astArgs || this.parseArgs(args)
          );
        }
      } else {
        var astArgs = mixin.astArgs || this.parseArgs(args);
        ast.push(
          t.expressionStatement(
            this.wrapCallExpression(
              t.callExpression(
                t.memberExpression(t.identifier('pug_mixins'), mixinName, true),
                astArgs
              )
            )
          )
        );
      }
      if (pp) {
        ast.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier('pug_indent'),
                t.identifier('pop')
              ),
              []
            )
          )
        );
      }
    }
    // mixin definition
    else {
      args = args ? args.split(',') : [];
      var rest;
      if (args.length && /^\.\.\./.test(args[args.length - 1].trim())) {
        rest = args
          .pop()
          .trim()
          .replace(/^\.\.\./, '');
      }
      var astArgs = args.map(function(arg) {
        return t.identifier(arg.trim());
      });
      // we need use pug_interp here for v8: https://code.google.com/p/v8/issues/detail?id=4165
      // once fixed, use this: this.buf.push(name + ' = function(' + args.join(',') + '){');
      var astMixin = [];

      astMixin.push(
        t.variableDeclaration('var', [
          t.variableDeclarator(
            t.identifier('block'),
            t.logicalExpression(
              '&&',
              t.thisExpression(),
              t.memberExpression(t.thisExpression(), t.identifier('block'))
            )
          ),
          t.variableDeclarator(
            t.identifier('attributes'),
            t.logicalExpression(
              '||',
              t.logicalExpression(
                '&&',
                t.thisExpression(),
                t.memberExpression(
                  t.thisExpression(),
                  t.identifier('attributes')
                )
              ),
              t.objectExpression([])
            )
          ),
        ])
      );

      if (rest) {
        astMixin.push(
          t.variableDeclaration('var', [
            t.variableDeclarator(t.identifier(rest), t.arrayExpression([])),
          ])
        );
        astMixin.push(
          t.forStatement(
            t.assignmentExpression(
              '=',
              t.identifier('pug_interp'),
              t.numericLiteral(args.length)
            ),
            t.binaryExpression(
              '<',
              t.identifier('pug_interp'),
              t.memberExpression(
                t.identifier('arguments'),
                t.identifier('length')
              )
            ),
            t.updateExpression('++', t.identifier('pug_interp'), false),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(t.identifier(rest), t.identifier('push')),
                [
                  t.memberExpression(
                    t.identifier('arguments'),
                    t.identifier('pug_interp'),
                    true
                  ),
                ]
              )
            )
          )
        );
      }

      this.parentIndents++;
      push.apply(astMixin, this.visit(block, mixin));
      this.parentIndents--;

      var mixinStmt = t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier('pug_mixins'), mixinName, true),
          t.assignmentExpression(
            '=',
            t.identifier('pug_interp'),
            t.functionExpression(
              null,
              astArgs,
              t.blockStatement(astMixin),
              this.useGenerators
            )
          )
        )
      );
      ast.push(mixinStmt);

      this.mixins[key].instances.push({stmt: mixinStmt});
    }
    return ast;
  },

  /**
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @param {boolean} interpolated
   * @api public
   */

  visitTag: function(tag, parent, interpolated) {
    this.indents++;
    var name = tag.name,
      pp = this.pp,
      self = this;
    var ast = [];

    function bufferName() {
      if (interpolated) {
        if (tag.astExpr) return self.bufferAST(tag.astExpr);
        return self.bufferExpression(tag.expr);
      } else return self.buffer(name);
    }

    if (WHITE_SPACE_SENSITIVE_TAGS[tag.name] === true)
      this.escapePrettyMode = true;

    if (!this.hasCompiledTag) {
      if (!this.hasCompiledDoctype && 'html' == name) {
        push.apply(ast, this.visitDoctype());
      }
      this.hasCompiledTag = true;
    }
    // pretty print
    if (pp && !tag.isInline) push.apply(ast, this.prettyIndent(0, true));
    if (tag.selfClosing || (!this.xml && selfClosing[tag.name])) {
      ast = concat.apply(ast, [
        this.buffer('<'),
        bufferName(),
        this.visitAttributes(
          tag.attrs,
          this.attributeBlocks(tag.attributeBlocks)
        ),
        this.buffer(this.terse && !tag.selfClosing ? '>' : '/>'),
      ]);

      // if it is non-empty throw an error
      if (
        tag.code ||
        (tag.block &&
          !(tag.block.type === 'Block' && tag.block.nodes.length === 0) &&
          tag.block.nodes.some(function(tag) {
            return tag.type !== 'Text' || !/^\s*$/.test(tag.val);
          }))
      ) {
        this.error(
          name +
            ' is a self closing element: <' +
            name +
            '/> but contains nested content.',
          'SELF_CLOSING_CONTENT',
          tag
        );
      }
    } else {
      // Optimize attributes buffering
      ast = concat.apply(ast, [
        this.buffer('<'),
        bufferName(),
        this.visitAttributes(
          tag.attrs,
          this.attributeBlocks(tag.attributeBlocks)
        ),
        this.buffer('>'),
        tag.code ? this.visitCode(tag.code) : [],
        this.visit(tag.block, tag),
        pp &&
        !tag.isInline &&
        WHITE_SPACE_SENSITIVE_TAGS[tag.name] !== true &&
        !tagCanInline(tag)
          ? this.prettyIndent(0, true)
          : [],
        this.buffer('</'),
        bufferName(),
        this.buffer('>'),
      ]);
    }

    if (WHITE_SPACE_SENSITIVE_TAGS[tag.name] === true)
      this.escapePrettyMode = false;

    this.indents--;
    return ast;
  },

  /**
   *  Compile attribute blocks.
   */
  attributeBlocks: function(attributeBlocks) {
    return (
      attributeBlocks &&
      attributeBlocks.slice().map(function(attrBlock) {
        return attrBlock.val;
      })
    );
  },
  /**
   * Visit InterpolatedTag.
   *
   * @param {InterpolatedTag} tag
   * @api public
   */

  visitInterpolatedTag: function(tag, parent) {
    return this.visitTag(tag, parent, true);
  },

  /**
   * Visit `text` node.
   *
   * @param {Text} text
   * @api public
   */

  visitText: function(text) {
    return this.buffer(text.val);
  },

  /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */

  visitComment: function(comment) {
    if (!comment.buffer) return;
    return concat.apply(
      [],
      [
        this.pp ? this.prettyIndent(1, true) : [],
        this.buffer('<!--' + comment.val + '-->'),
      ]
    );
  },

  /**
   * Visit a `YieldBlock`.
   *
   * This is necessary since we allow compiling a file with `yield`.
   *
   * @param {YieldBlock} block
   * @api public
   */

  visitYieldBlock: function(block) {
    return [];
  },

  /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */

  visitBlockComment: function(comment) {
    var ast = [];
    if (!comment.buffer) return;
    ast = ast.concat.apply(ast, [
      this.pp ? this.prettyIndent(1, true) : [],
      this.buffer('<!--' + (comment.val || '')),
      this.visit(comment.block, comment),
      this.pp ? this.prettyIndent(1, true) : [],
      this.buffer('-->'),
    ]);
    return ast;
  },

  /**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */

  visitCode: function(code, ctx) {
    // Wrap code blocks with {}.
    // we only wrap unbuffered code blocks ATM
    // since they are usually flow control
    // Buffer code
    //
    var ast = [];
    if (code.buffer) {
      var val = code.val.trim();
      if (code.mustEscape !== false) {
        ast = JSON.parse(tpl_json_interp_escape).expression;
        ast.callee = this.runtime('escape', true);
        ast.arguments[0].test.right.right =
          code.astVal || this.parseExpr(code.val);
      } else {
        ast = JSON.parse(tpl_json_interp).expression;
        ast.test.right.right = code.astVal || this.parseExpr(code.val);
      }
      ast = [this.bufferAST(ast)];
    } else {
      var val = code.val.trim();
      this.codeBuffer += '\n' + val;

      if (code.block) {
        this.codeIndex++;
        var marker = 'PUGMARKER' + this.codeIndex;
        this.codeBuffer += '\n{' + marker + '}\n';
        // snaphsot current unbuffered code level
        // this is necessary to accept embedded code blocks
        // - if (true) {
        //   - var a = 1;
        // - }
        // but breaks the "should be reasonably fast" compile test
        // note: we should add a test for this in pug
        var savedCodeBuffer = this.codeBuffer;
        var savedCodeMarker = this.codeMarker;
        var savedCodeIndex = this.codeIndex;

        this.codeBuffer = 'plug=function*(){';
        this.codeMarker = {};
        this.codeIndex = -1;

        var body = this.visit(code.block, code);

        this.codeBuffer = savedCodeBuffer;
        this.codeMarker = savedCodeMarker;
        this.codeIndex = savedCodeIndex;

        this.codeMarker[marker] = body;
      }

      var idx = ctx.nodes.indexOf(code) + 1;
      if (
        idx == ctx.nodes.length ||
        ctx.nodes[idx].type != 'Code' ||
        ctx.nodes[idx].buffer
      ) {
        try {
          var src = this.codeBuffer + '}';
          var tpl = babelTemplate(src);
          push.apply(ast, tpl(this.codeMarker).expression.right.body.body);
          this.codeBuffer = 'plug=function*(){';
          this.codeIndex = -1;
          this.codeMarker = {};
        } catch (e) {
          var codeError = this.codeBuffer.substr(14).trim();
          this.error(
            'Unbuffered code structure could not be parsed; ' +
              e.message +
              ' in ' +
              codeError,
            codeError,
            code
          );
        }
      }
    }
    return ast;
  },

  /**
   * Visit `Conditional`.
   *
   * @param {Conditional} cond
   * @api public
   */

  visitConditional: function(cond) {
    var test = cond.test;

    var blockConsequent = this.visit(cond.consequent, cond);
    var c = t.ifStatement(
      cond.astTest || this.parseExpr(test),
      t.blockStatement(blockConsequent)
    );

    if (cond.alternate) {
      if (cond.alternate.type === 'Conditional') {
        c.alternate = this.visitConditional(cond.alternate)[0];
      } else {
        var blockAlternate = this.visit(cond.alternate, cond);
        c.alternate = t.blockStatement(blockAlternate);
      }
    }
    return [c];
  },

  /**
   * Visit `While`.
   *
   * @param {While} loop
   * @api public
   */

  visitWhile: function(loop) {
    var test = loop.test;
    var whileBlock = this.visit(loop.block, loop);
    var w = t.whileStatement(
      loop.astTest || this.parseExpr(test),
      t.blockStatement(whileBlock)
    );
    return [w];
  },

  /**
   * Visit `each` block.
   *
   * @param {Each} each
   * @api public
   */

  visitEach: function(each) {
    var ast = [];
    var indexVarName = each.key || 'pug_index' + this.eachCount;
    this.eachCount++;

    var body = [
      t.variableDeclaration('var', [
        t.variableDeclarator(
          t.identifier('$$obj'),
          each.astObj || this.parseExpr(each.obj)
        ),
      ]),
    ];

    var func = t.expressionStatement(
      this.wrapCallExpression(
        t.callExpression(
          t.memberExpression(
            t.functionExpression(
              null,
              [],
              t.blockStatement(body),
              this.useGenerators
            ),
            t.identifier('call')
          ),
          [t.thisExpression()]
        )
      )
    );
    ast.push(func);

    var blockEach = [
      t.variableDeclaration('var', [
        t.variableDeclarator(
          t.identifier(each.val),
          t.memberExpression(
            t.identifier('$$obj'),
            t.identifier(indexVarName),
            true
          )
        ),
      ]),
    ];
    var blockAlt = [];

    push.apply(blockEach, this.visit(each.block, each));
    var arrayLoop = t.blockStatement([
      t.forStatement(
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier(indexVarName), t.numericLiteral(0)),
          t.variableDeclarator(
            t.identifier('$$l'),
            t.memberExpression(t.identifier('$$obj'), t.identifier('length'))
          ),
        ]),
        t.binaryExpression(
          '<',
          t.identifier(indexVarName),
          t.identifier('$$l')
        ),
        t.updateExpression('++', t.identifier(indexVarName), false),
        t.blockStatement(blockEach)
      ),
    ]);

    var blockObj = [
      t.expressionStatement(
        t.updateExpression('++', t.identifier('$$l'), false)
      ),
      t.variableDeclaration('var', [
        t.variableDeclarator(
          t.identifier(each.val),
          t.memberExpression(
            t.identifier('$$obj'),
            t.identifier(indexVarName),
            true
          )
        ),
      ]),
    ];
    var blockObjAlt = [];

    push.apply(blockObj, this.visit(each.block, each));
    var objectLoop = t.blockStatement([
      t.variableDeclaration('var', [
        t.variableDeclarator(t.identifier('$$l'), t.numericLiteral(0)),
      ]),
      t.forInStatement(
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier(indexVarName)),
        ]),
        t.identifier('$$obj'),
        t.blockStatement(blockObj)
      ),
    ]);

    if (each.alternate) {
      push.apply(blockAlt, this.visit(each.alternate, each));
      arrayLoop = t.ifStatement(
        t.memberExpression(t.identifier('$$obj'), t.identifier('length')),
        arrayLoop,
        t.blockStatement(blockAlt)
      );
    }

    if (each.alternate) {
      push.apply(blockObjAlt, this.visit(each.alternate, each));
      objectLoop.body.push(
        t.ifStatement(
          t.binaryExpression('===', t.identifier('$$l'), t.numericLiteral(0)),
          t.blockStatement(blockObjAlt)
        )
      );
    }

    var it = t.ifStatement(
      t.binaryExpression(
        '==',
        t.stringLiteral('number'),
        t.unaryExpression(
          'typeof',
          t.memberExpression(t.identifier('$$obj'), t.identifier('length'))
        )
      ),
      arrayLoop,
      objectLoop
    );
    body.push(it);

    return ast;
  },

  visitEachOf: function(each) {
    const forOfBlock = this.visit(each.block, each);
    const forOf = t.forOfStatement(
      t.variableDeclaration('var', [
        t.variableDeclarator(t.identifier(each.val)),
      ]),
      t.identifier(each.obj),
      t.blockStatement(forOfBlock)
    );
    return forOf;
  },

  /**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */

  visitAttributes: function(attrs, attributeBlocks) {
    let ast = [];
    if (attributeBlocks.length) {
      if (attrs.length) {
        var val = this.attrs(attrs);
        attributeBlocks.unshift(val);
      }
      if (attributeBlocks.length > 1) {
        ast = this.bufferExpression(
          this.runtime('attrs') +
            '(' +
            this.runtime('merge') +
            '([' +
            attributeBlocks.join(',') +
            ']), ' +
            stringify(this.terse) +
            ')'
        );
      } else {
        ast = this.bufferExpression(
          this.runtime('attrs') +
            '(' +
            attributeBlocks[0] +
            ', ' +
            stringify(this.terse) +
            ')'
        );
      }
    } else if (attrs.length) {
      ast = this.bufferExpression(this.attrs(attrs, true));
    }
    return ast;
  },

  /**
   * Compile attributes.
   */

  attrs: function(attrs, buffer) {
    var res = compileAttrs(attrs, {
      terse: this.terse,
      format: buffer ? 'html' : 'object',
      runtime: this.runtime.bind(this),
    });
    return res;
  },
};

function tagCanInline(tag) {
  function isInline(node) {
    // Recurse if the node is a block
    if (node.type === 'Block') return node.nodes.every(isInline);
    // When there is a YieldBlock here, it is an indication that the file is
    // expected to be included but is not. If this is the case, the block
    // must be empty.
    if (node.type === 'YieldBlock') return true;
    return (node.type === 'Text' && !/\n/.test(node.val)) || node.isInline;
  }

  return tag.block.nodes.every(isInline);
}
