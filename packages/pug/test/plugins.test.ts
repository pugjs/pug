const pug = require('../');

test('#3295 - lexer plugins should be used in tag interpolation', () => {
  const lex = {
    advance(lexer) {
      if ('~' === lexer.input.charAt(0)) {
        lexer.tokens.push(lexer.tok('text', 'twiddle-dee-dee'));
        lexer.consume(1);
        lexer.incrementColumn(1);
        return true;
      }
    },
  };
  const input = 'p Look at #[~]';
  const expected = '<p>Look at twiddle-dee-dee</p>';
  const output = pug.render(input, {plugins: [{lex}]});
  expect(output).toEqual(expected);
});
