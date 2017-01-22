var fs = require('fs');
var acorn = require('acorn');
var walk = require('acorn/dist/walk');

var hadErrors = false;

var lexerFunctions = {
  advance: true,
  append: true,
  attributesBlock: true,
  attrs: true,
  blank: true,
  block: true,
  blockCode: true,
  call: true,
  case: true,
  className: true,
  code: true,
  colon: true,
  comment: true,
  conditional: true,
  default: true,
  doctype: true,
  dot: true,
  each: true,
  eos: true,
  endInterpolation: true,
  extends: true,
  filter: true,
  id: true,
  include: true,
  indent: true,
  interpolation: true,
  isExpression: true,
  mixin: true,
  mixinBlock: true,
  path: true,
  pipelessText: true,
  prepend: true,
  slash: true,
  tag: true,
  text: true,
  textHtml: true,
  when: true,
  while: true,
  yield: true,
};

module.exports = function () {
  var str = fs.readFileSync(__dirname + '/../index.js', 'utf8');
  var ast = acorn.parse(str, {locations: true});
  walk.simple(ast, {
    CallExpression: function (node) {
      checkDirectCalls(node);
      checkMissingLexerFunction(node);
    }
  });
  if (hadErrors) process.exit(1);
};

function checkDirectCalls (node) {
  var callee = node.callee;
  if (callee.type !== 'MemberExpression') return;
  if (callee.object.type !== 'ThisExpression') return;
  var property = callee.property;
  var func;
  if (callee.computed) {
    if (property.type !== 'Literal') return;
    func = property.value;
  } else {
    func = property.name;
  }
  if (!lexerFunctions[func]) return;
  console.log('index.js:' + node.loc.start.line + ':' + node.loc.start.column + ': Lexer function ' + func + ' called directly');
  hadErrors = true;
}

function checkMissingLexerFunction (node) {
  var callee = node.callee;
  if (callee.type !== 'MemberExpression') return;
  if (callee.object.type !== 'ThisExpression') return;
  var property = callee.property;
  var func;
  if (callee.computed) {
    if (property.type !== 'Literal') return;
    func = property.value;
  } else {
    func = property.name;
  }
  if (func !== 'callLexerFunction') return;
  if (!node.arguments.length) return;
  if (node.arguments[0].type !== 'Literal') return;
  func = node.arguments[0].value;
  if (lexerFunctions[func]) return;
  console.log('index.js:' + node.loc.start.line + ':' + node.loc.start.column + ': Lexer function ' + func + ' not in lexerFunctions list');
  hadErrors = true;
}
