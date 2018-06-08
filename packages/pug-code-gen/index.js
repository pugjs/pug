'use strict';

var doctypes = require('doctypes');
var makeError = require('pug-error');
var buildRuntime = require('pug-runtime/build');
var runtime = require('pug-runtime');
var compileAttrs = require('pug-attrs');
var selfClosing = require('void-elements');
var constantinople = require('constantinople');
var stringify = require('js-stringify');

var t = require('babel-types');
var gen = require('babel-generator');
var babylon = require('babylon');
var babelTemplate = require('babel-template');
var babel = require('babel-core');
var babelPluginTransformWith = require('babel-plugin-transform-with');
var babelPluginPugConcat = require('./babel-plugin-pug-concat.js');
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

var tpl_interp = babelTemplate('null == (pug_interp = VALUE) ? "" : pug_interp');
var tpl_interp_escape = babelTemplate('ESCAPE(null == (pug_interp = VALUE) ? "" : pug_interp)');

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
  this.codeBuffer = '_=function*(){';
  this.codeMarker = {};
  this.codeIndex = -1;

  this.useGenerators = false;
  this.templateVars = ['locals']

};

/**
 * Compiler prototype.
 */

Compiler.prototype = {
  runtime: function (name, asAST) {
    if (this.inlineRuntimeFunctions) {
      this.runtimeFunctionsUsed.push(name);
      return asAST ? t.identifier('pug_' + name) : 'pug_' + name;
    } else {
      return asAST ? t.memberExpression(t.identifier('pug'), t.identifier(name)) : 'pug.' + name;
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
    return babylon.parse("a("+args+")").program.body.pop().expression.arguments;
  },
  btpl_addWith: function() {
    var globals = this.options.globals ? this.options.globals.concat(INTERNAL_VARIABLES) : INTERNAL_VARIABLES;
    globals.concat(this.runtimeFunctionsUsed.map(function (name) { return 'pug_' + name; }));
    var tpl = "// @with exclude: "+ globals.join(",") +"\n{\nlocals || {};\nSOURCE;\n}"
    var tplc = babelTemplate(tpl, { preserveComments: true });
    return tplc;
  },
  ast_variableDeclaration: function() {
    return t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('pug_html'), t.stringLiteral('')),
          t.variableDeclarator(t.identifier('pug_mixins'), t.objectExpression([])),
          t.variableDeclarator(t.identifier('pug_interp'), null)
        ])
  },
  ast_return: function() {
    return [t.returnStatement(t.identifier('pug_html'))];
  },
  ast_stringify: function(lit) {
    lit.extra = { rawValue: lit.value, raw: stringify(lit.value) };
    return lit;
  },
  wrapCallExpression: function(node) {
    return node;
  },
  ast_buffer: function(ast) {
    return [t.expressionStatement(
            t.assignmentExpression('=',
              t.identifier('pug_html'),
              t.binaryExpression('+', t.identifier('pug_html'), ast)
            ))];
  },
  /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */

  compile: function(){
    var ast = [];
    if (this.pp) {
      ast.push(t.variableDeclaration('var', [t.variableDeclarator(t.identifier('pug_indent'), t.arrayExpression())]));
    }
    push.apply(ast, this.visit(this.node));
    if (!this.dynamicMixins) {
      // if there are no dynamic mixins we can remove any un-used mixins
      var mixinNames = Object.keys(this.mixins);
      for (var i = 0; i < mixinNames.length; i++) {
        var mixin = this.mixins[mixinNames[i]];
        if (!mixin.used) {
          for (var x = 0; x < mixin.instances.length; x++) {
            mixin.instances[x].stmt.type = "EmptyStatement";
            delete mixin.instances[x].stmt.expression;
          }
        }
      }
    }
    
    if (this.options.self) {
      ast = [
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('self'), t.logicalExpression('||', t.identifier('locals'), t.objectExpression([])))
        ])
      ].concat(ast);
    } else {

      // prepare block for babel-plugin-transform-with 
      var tplc = this.btpl_addWith();
      ast = tplc({ SOURCE: ast })
      // bypass bug of babel-template preserveComments option (?)
      ast.leadingComments = tplc().leadingComments;

      ast = [ast];
    }


    if (this.debug) {
      if (this.options.includeSources) {
        ast.unshift(t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('pug_debug_sources'), this.parseExpr(stringify(this.options.includeSources)))
        ]))
      }

 
      var rethrowArgs = [
                t.identifier('err'),
                t.identifier('pug_debug_filename'),
                t.identifier('pug_debug_line')
              ]
      if (this.options.includeSources) {
          rethrowArgs.push(t.memberExpression(t.identifier('pug_debug_sources'), t.identifier('pug_debug_filename'), true))
      } 
      ast = [
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('pug_debug_filename'), null),
          t.variableDeclarator(t.identifier('pug_debug_line'), null)
        ]),
        t.tryStatement(
          t.blockStatement(ast),
          t.catchClause(
            t.identifier('err'),
            t.blockStatement([t.expressionStatement(t.callExpression(
              (this.inlineRuntimeFunctions ? t.identifier('pug_rethrow') : t.memberExpression(t.identifier('pug'), t.identifier('rethrow'))),
              rethrowArgs
            ))])
          )
        )
      ]

    }

    ast = t.functionDeclaration(
      t.identifier(this.options.templateName || 'template'),
      this.templateVars.map(function(v) { return t.identifier(v)}),
      t.blockStatement([this.ast_variableDeclaration()].concat(ast, this.ast_return()))
    )


    var file = babylon.parse('');
    file.program.body = [ast];
    var w = babel.transformFromAst(file, null, {
      code: false,
      plugins: [
        babelPluginPugConcat,
        babelPluginTransformWith
      ]
    });


    return buildRuntime(this.runtimeFunctionsUsed) + gen.default(w.ast).code;
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

  buffer: function (str) {
    var lit = this.ast_stringify(t.stringLiteral(str));
    var ast = this.ast_buffer(lit);
    return ast;
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

  prettyIndent: function(offset, newline){
    var ast;
    offset = offset || 0;
    newline = newline ? '\n' : '';
    ast = this.buffer(newline + Array(this.indents + offset).join(this.pp));
    if (this.parentIndents) {

      push.apply(ast, this.ast_buffer(t.callExpression(
                                t.memberExpression(t.identifier('pug_indent'), t.identifier('join')),
                                [t.stringLiteral('')]
                              )));

    }
    return ast;
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visit: function(node, parent){
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
        ast.push(t.expressionStatement(t.assignmentExpression('=', t.identifier('pug_debug_line'), t.numericLiteral(node.line))))
        if (node.filename) {
          ast.push(t.expressionStatement(t.assignmentExpression('=', t.identifier('pug_debug_filename'), t.stringLiteral(node.filename))))
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

    push.apply(ast, this.visitNode(node, parent));
    return ast;
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visitNode: function(node, parent){
    return this['visit' + node.type](node, parent);
  },

  /**
   * Visit case `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitCase: function(node){
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

  visitWhen: function(node){
    var test = null;
    if ('default' != node.expr) {
      test = node.astExpr || this.parseExpr(node.expr);
    }
    var consequent = []
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

  visitLiteral: function(node){
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
    if (pp && block.nodes.length > 1 && !escapePrettyMode &&
        block.nodes[0].type === 'Text' && block.nodes[1].type === 'Text' ) {
      push.apply(ast, this.prettyIndent(1, true));
    }
    for (var i = 0; i < block.nodes.length; ++i) {
      // Pretty print text
      if (pp && i > 0 && !escapePrettyMode &&
          block.nodes[i].type === 'Text' && block.nodes[i-1].type === 'Text' &&
          /\n$/.test(block.nodes[i - 1].val)) {
        push.apply(ast,this.prettyIndent(1, false));
      }
      push.apply(ast, this.visit(block.nodes[i], block));
    }
    return ast;
  },

  /**
   * Visit a mixin's `block` keyword.
   *
   * @param {MixinBlock} block
   * @api public
   */

  visitMixinBlock: function(block){
    var ast = [];
    if (this.pp) {
      ast.push(t.expressionStatement(t.callExpression(
        t.memberExpression(t.identifier('pug_indent'), t.identifier('push')),
        [t.stringLiteral(Array(this.indents + 1).join(this.pp))]
      )))
    }
    ast.push(
      t.expressionStatement(t.logicalExpression('&&',
        t.identifier('block'),
        this.wrapCallExpression(t.callExpression(t.identifier('block'), []))
      ))
    );
    if (this.pp) {
      ast.push(t.expressionStatement(t.callExpression(
        t.memberExpression(t.identifier('pug_indent'), t.identifier('pop')),
        []
      )))
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

  visitDoctype: function(doctype){
    var ast = [];
    if (doctype && (doctype.val || !this.doctype)) {
      this.setDoctype(doctype.val || 'html');
    }

    if (this.doctype) push.apply(ast, this.buffer(this.doctype));
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

  visitMixin: function(mixin){
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
    name += (dynamic ? mixin.name.substr(2,mixin.name.length-3):'"'+mixin.name+'"')+']';
    var mixinName = dynamic ? (mixin.astName || this.parseExpr(mixin.name.substr(2,mixin.name.length-3))): t.stringLiteral(mixin.name);
    this.mixins[key] = this.mixins[key] || {used: false, instances: []};

    // mixin invocation
    if (mixin.call) {
      this.mixins[key].used = true;
      if (pp) {
        ast.push(t.expressionStatement(t.callExpression(
          t.memberExpression(t.identifier('pug_indent'), t.identifier('push')),
          [t.stringLiteral(Array(this.indents + 1).join(pp))]
        )))
      }
      if (block || attrs.length || attrsBlocks.length) {

        var astArgs = []
        ast.push(
          t.expressionStatement(this.wrapCallExpression(t.callExpression(
            t.memberExpression(
              t.memberExpression(t.identifier('pug_mixins'), mixinName, true),
              t.identifier("call")
            ),
            astArgs
          )))
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

          astKey.push(t.objectProperty(
            t.identifier('block'),
            t.functionExpression(
              null,
              [],
              t.blockStatement(astFunc),
              this.useGenerators
            )
          ));
 
        }

        if (attrsBlocks.length) {
          if (attrs.length) {
            var val = this.attrs(attrs);
            attrsBlocks.unshift(val);
          }
          if (attrsBlocks.length > 1) {
            astKey.push(t.objectProperty(
              t.identifier('attributes'),
              t.callExpression(
                this.runtime('merge', true),
                attrsBlocks.map(function(b) { return self.parseExpr(b) })
              )
            ));
          } else {
            astKey.push(t.objectProperty(
              t.identifier('attributes'),
              this.parseExpr(attrsBlocks[0])
            ));
          }
        } else if (attrs.length) {
          var val = this.attrs(attrs);
          astKey.push(t.objectProperty(
            t.identifier('attributes'),
            this.parseExpr(val)
          ));
        }

        if (args) { 
          args = args ? args.split(',') : [];
          Array.prototype.push.apply(astArgs, mixin.astArgs || this.parseArgs(args) )
        }
      } else {
        var astArgs = mixin.astArgs || this.parseArgs(args);
        ast.push(t.expressionStatement(this.wrapCallExpression(t.callExpression(
          t.memberExpression(t.identifier('pug_mixins'), mixinName, true),
          astArgs
        ))));
      }
      if (pp) {
        ast.push(t.expressionStatement(t.callExpression(
          t.memberExpression(t.identifier('pug_indent'), t.identifier('pop')),
          []
        )))
 
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
      var astArgs = args.map(function(arg) { return t.identifier(arg.trim())})
      // we need use pug_interp here for v8: https://code.google.com/p/v8/issues/detail?id=4165
      // once fixed, use this: this.buf.push(name + ' = function(' + args.join(',') + '){');
      var astMixin = [];

      astMixin.push(
        t.variableDeclaration('var', [
          t.variableDeclarator(
            t.identifier('block'),
            t.logicalExpression('&&', t.thisExpression(), t.memberExpression(t.thisExpression(), t.identifier('block')))
          ),
          t.variableDeclarator(
            t.identifier('attributes'),
            t.logicalExpression('||',
              t.logicalExpression('&&', t.thisExpression(), t.memberExpression(t.thisExpression(), t.identifier('attributes'))),
              t.objectExpression([])
            )
          )
        ])
      )

      if (rest) {
        astMixin.push(
          t.variableDeclaration('var', [
            t.variableDeclarator(
              t.identifier(rest),
              t.arrayExpression([])
            )
          ])
        )
        astMixin.push(
          t.forStatement(
            t.assignmentExpression('=', t.identifier('pug_interp'), t.numericLiteral(args.length)),
            t.binaryExpression('<', t.identifier('pug_interp'), t.memberExpression(t.identifier('arguments'), t.identifier('length'))),
            t.updateExpression('++', t.identifier('pug_interp'), false),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(t.identifier(rest), t.identifier('push')),
                [t.memberExpression(t.identifier('arguments'), t.identifier('pug_interp'), true)]
              )
            )
          )
        )
      }

      this.parentIndents++;
      push.apply(astMixin, this.visit(block, mixin));
      this.parentIndents--;


      var mixinStmt = 
        t.expressionStatement(
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

  visitTag: function(tag, parent, interpolated){
    this.indents++;
    var name = tag.name
      , pp = this.pp
      , self = this;
    var ast = [];

    function bufferName() {
      if (interpolated) {
        if (tag.astExpr) return self.bufferAST(tag.astExpr);
        return self.bufferExpression(tag.expr);
      }
      else return self.buffer(name);
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
    if (pp && !tag.isInline)
      push.apply(ast, this.prettyIndent(0, true));
    if (tag.selfClosing || (!this.xml && selfClosing[tag.name])) {
      push.apply(ast, this.buffer('<'));
      push.apply(ast, bufferName());
      push.apply(ast, this.visitAttributes(tag.attrs, this.attributeBlocks(tag.attributeBlocks)));
      if (this.terse && !tag.selfClosing) {
        push.apply(ast, this.buffer('>'));
      } else {
        push.apply(ast, this.buffer('/>'));
      }
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
      push.apply(ast, this.buffer('<'));
      push.apply(ast, bufferName());
      push.apply(ast, this.visitAttributes(tag.attrs, this.attributeBlocks(tag.attributeBlocks)));
      push.apply(ast, this.buffer('>'));
      if (tag.code) push.apply(ast, this.visitCode(tag.code));
      push.apply(ast, this.visit(tag.block, tag));

      // pretty print
      if (pp && !tag.isInline && WHITE_SPACE_SENSITIVE_TAGS[tag.name] !== true && !tagCanInline(tag))
        push.apply(ast, this.prettyIndent(0, true));

      push.apply(ast, this.buffer('</'));
      push.apply(ast, bufferName());
      push.apply(ast, this.buffer('>'));
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
    return attributeBlocks && attributeBlocks.slice().map(function(attrBlock){
      return attrBlock.val;
    });
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

  visitText: function(text){
    return this.buffer(text.val);
  },

  /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */

  visitComment: function(comment){
    var ast = [];
    if (!comment.buffer) return;
    if (this.pp) push.apply(ast, this.prettyIndent(1, true));
    push.apply(ast, this.buffer('<!--' + comment.val + '-->'));
    return ast;
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

  visitBlockComment: function(comment){
    var ast = [];
    if (!comment.buffer) return;
    if (this.pp) push.apply(ast, this.prettyIndent(1, true));
    push.apply(ast, this.buffer('<!--' + (comment.val || '')));
    push.apply(ast, this.visit(comment.block, comment));
    if (this.pp) push.apply(ast, this.prettyIndent(1, true));
    push.apply(ast, this.buffer('-->'));
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

  visitCode: function(code, ctx){
    // Wrap code blocks with {}.
    // we only wrap unbuffered code blocks ATM
    // since they are usually flow control
    // Buffer code
    //
    var ast = [];
    if (code.buffer) {
      var val = code.val.trim();
      var tpl = tpl_interp;
      var tplv = {
        VALUE: code.astVal || this.parseExpr(code.val)
      }
      if (code.mustEscape !== false) {
        tpl = tpl_interp_escape;
        tplv.ESCAPE = this.runtime('escape', true);
      }
      push.apply(ast, this.bufferAST(tpl(tplv).expression));
    } else {

      var val = code.val.trim();
      this.codeBuffer += "\n" + val;

      if (code.block) {
        this.codeIndex++;
        var marker = "PUGMARKER"+this.codeIndex;
        this.codeBuffer += "\n{" + marker + "}\n";
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

        this.codeBuffer = '_=function*(){';
        this.codeMarker = {};
        this.codeIndex = -1;

        var body = this.visit(code.block, code);

        this.codeBuffer = savedCodeBuffer;
        this.codeMarker = savedCodeMarker;
        this.codeIndex = savedCodeIndex;
       
        this.codeMarker[marker] = body; 
      }

      var idx = ctx.nodes.indexOf(code) + 1;
      if (idx == ctx.nodes.length || ctx.nodes[idx].type != 'Code' || ctx.nodes[idx].buffer) {
        try {
          var src = this.codeBuffer + '}';
          var tpl = babelTemplate(src);
          push.apply(ast, tpl(this.codeMarker).expression.right.body.body);
          this.codeBuffer = '_=function*(){';
          this.codeIndex = -1;
          this.codeMarker = {};
        } catch(e) {
          var codeError = this.codeBuffer.substr(14).trim()
          this.error('Unbuffered code structure could not be parsed; ' + e.message + ' in ' + codeError, codeError, code)
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

  visitEach: function(each){
    var ast = [];
    var indexVarName = each.key || 'pug_index' + this.eachCount;
    this.eachCount++;


    var body =  [
                  t.variableDeclaration('var', [
                    t.variableDeclarator(t.identifier('$$obj'), each.astObj || this.parseExpr(each.obj))
                  ])
                ]

    var func =  t.expressionStatement(
                  this.wrapCallExpression(t.callExpression(
                    t.memberExpression(
                      t.functionExpression(
                        null,
                        [],
                        t.blockStatement(body),
                        this.useGenerators
                      ),
                      t.identifier('call')
                    )
                    ,[t.thisExpression()]
                  ))
                )
    ast.push(func)


      var blockEach = [
        t.variableDeclaration('var', [
            t.variableDeclarator(t.identifier(each.val), t.memberExpression(t.identifier('$$obj'), t.identifier(indexVarName), true) )
        ])
      ];
      var blockAlt = [];
 
      push.apply(blockEach, this.visit(each.block, each));
      var arrayLoop = 
          t.blockStatement([t.forStatement(
            t.variableDeclaration('var', [
              t.variableDeclarator(t.identifier(indexVarName), t.numericLiteral(0)),
              t.variableDeclarator(t.identifier('$$l'), t.memberExpression(t.identifier('$$obj'), t.identifier('length')))
            ]),
            t.binaryExpression('<', t.identifier(indexVarName), t.identifier('$$l')),
            t.updateExpression('++', t.identifier(indexVarName), false),
            t.blockStatement(blockEach)
          )]);


      var blockObj = [
        t.expressionStatement(t.updateExpression('++', t.identifier('$$l'), false)),
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier(each.val), t.memberExpression(t.identifier('$$obj'), t.identifier(indexVarName), true) )
        ])
      ]
      var blockObjAlt = [];

      push.apply(blockObj, this.visit(each.block, each));
      var objectLoop = t.blockStatement([
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('$$l'), t.numericLiteral(0))
        ]),
        t.forInStatement(
          t.variableDeclaration('var', [
            t.variableDeclarator(t.identifier(indexVarName))
          ]),
          t.identifier('$$obj'),
          t.blockStatement(blockObj)
        )
      ])



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
      objectLoop.body.push(t.ifStatement(
            t.binaryExpression('===', t.identifier('$$l'), t.numericLiteral(0)),
            t.blockStatement(blockObjAlt)
      ))
    }

    var it = t.ifStatement(
        t.binaryExpression('==', t.stringLiteral('number'), t.unaryExpression('typeof', t.memberExpression(t.identifier('$$obj'), t.identifier('length')))),
        arrayLoop, objectLoop)
    body.push(it);

    return ast;

  },

  visitEachOf: function(each) {
    this.buf.push(
      '' +
        '// iterate ' +
        each.obj +
        '\n' +
        'for (const ' +
        each.val +
        ' of ' +
        each.obj +
        ') {\n'
    );

    this.visit(each.block, each);

    this.buf.push('}\n');
  },

  /**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */

  visitAttributes: function(attrs, attributeBlocks){
    var ast = [];
    if (attributeBlocks.length) {
      if (attrs.length) {
        var val = this.attrs(attrs);
        attributeBlocks.unshift(val);
      }
      if (attributeBlocks.length > 1) {
        push.apply(ast, this.bufferExpression(this.runtime('attrs') + '(' + this.runtime('merge') + '([' + attributeBlocks.join(',') + ']), ' + stringify(this.terse) + ')'));
      } else {
        push.apply(ast, this.bufferExpression(this.runtime('attrs') + '(' + attributeBlocks[0] + ', ' + stringify(this.terse) + ')'));
      }
    } else if (attrs.length) {
      push.apply(ast, this.bufferExpression(this.attrs(attrs, true)));
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
  }
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
