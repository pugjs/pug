'use strict';

var lex = require('pug-lexer');
var parse = require('../');

const input = `
div
  | Hello
  | World
`

test('no uncessessary blocks should be added', () => {
  expect(parse(lex(input))).toMatchSnapshot();
});
