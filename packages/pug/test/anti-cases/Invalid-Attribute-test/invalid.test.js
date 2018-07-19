const pug = require('../../../');

test('invalid attribute name should log warning', () => {
  const oldWarn = console.warn;
  const warnings = [];
  console.warn = warnings.push.bind(warnings);
  pug.compileFile(
    __dirname + '/invalid-character.pug'
  );
  console.warn = oldWarn;
  expect(warnings).toMatchSnapshot();
});
