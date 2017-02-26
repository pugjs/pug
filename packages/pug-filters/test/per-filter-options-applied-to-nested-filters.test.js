const lex = require('pug-lexer');
const parse = require('pug-parser');
const handleFilters = require('../').handleFilters;

const customFilters = {};
test('per filter options are applied, even to nested filters', () => {
  const source = `
script
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
    'uglify-js': {output: {beautify: true}},
  };

  const output = handleFilters(ast, customFilters, options);
  expect(output).toMatchSnapshot();

  // TODO: render with `options.filterOptions['uglify-js']`
});
