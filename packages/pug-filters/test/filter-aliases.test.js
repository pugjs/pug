const lex = require('pug-lexer');
const parse = require('pug-parser');
const handleFilters = require('../').handleFilters;

const customFilters = {};
test('filters can be aliased', () => {
  const source = `
script
  :cdata:minify
    function myFunc(foo) {
      return foo;
    }
  `;

  const ast = parse(
    lex(source, {filename: __filename}),
    {filename: __filename, src: source}
  );

  const options = {};
  const aliases = {
    'minify': 'uglify-js',
  };

  const output = handleFilters(ast, customFilters, options, aliases);
  expect(output).toMatchSnapshot();
});

test('we do not support chains of aliases', () => {
  const source = `
script
  :cdata:minify-js
    function myFunc(foo) {
      return foo;
    }
  `;

  const ast = parse(
    lex(source, {filename: __filename}),
    {filename: __filename, src: source}
  );

  const options = {};
  const aliases = {
    'minify-js': 'minify',
    'minify': 'uglify-js',
  };

  try {
    const output = handleFilters(ast, customFilters, options, aliases);
  } catch (ex) {
    expect({
      code: ex.code,
      message: ex.message,
    }).toMatchSnapshot();
    return;
  }
  throw new Error('Expected an exception');
});

test('options are applied before aliases', () => {
  const source = `
script
  :cdata:minify
    function myFunc(foo) {
      return foo;
    }
  :cdata:uglify-js
    function myFunc(foo) {
      return foo;
    }
  `;

  const ast = parse(
    lex(source, {filename: __filename}),
    {filename: __filename, src: source}
  );


  const options = {
    'minify': {output: {beautify: true}},
  };
  const aliases = {
    'minify': 'uglify-js',
  };

  const output = handleFilters(ast, customFilters, options, aliases);
  expect(output).toMatchSnapshot();
});
