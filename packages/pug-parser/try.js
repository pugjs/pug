var lex = require('../pug-lexer');
var parse = require('./');

var filename = 'my-file.pug';
var src = `
-

  import { Block } from 'dwayne';
  import { Block } from 'dwayne';

div(data-foo="bar", k=a.c)
  a&attributes(attrs)
  :cdata
    123
`;
var src = `
script
  :cdata:uglify-js
    function myFunc(foo) {
      return foo;
    }
  `;
var tokens = lex(src, {filename});

console.log(tokens);

var ast = parse(tokens, {filename, src});

console.log(JSON.stringify(ast, null, '  '));
