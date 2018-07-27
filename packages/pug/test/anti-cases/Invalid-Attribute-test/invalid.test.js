const pug = require('../../../');

test('invalid attribute name should log warning', () => {
  const oldWarn = console.warn;
  const warnings = [];
  console.warn = warnings.push.bind(warnings);
  pug.compileFile(
    __dirname + '/invalid-character.pug'
  );
  console.warn = oldWarn;
  warnings.map(warning => warning.replace(/\\/g, '/').split(process.cwd().replace(/\\/g, '/')).join('<cwd>'));
  expect(warnings).toMatchSnapshot();
});
