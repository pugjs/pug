const pug = require('../../');

// regression test for #2404

test('extends not top level should throw an error', () => {
  expect(
    () => pug.compileFile(
      __dirname + '/index.pug'
    )
  ).toThrow('Declaration of template inheritance ("extends") should be the first thing in the file. There can only be one extends statement per file.');
});

test('duplicate extends should throw an error', () => {
  expect(
    () => pug.compileFile(
      __dirname + '/duplicate.pug'
    )
  ).toThrow('Declaration of template inheritance ("extends") should be the first thing in the file. There can only be one extends statement per file.');
});
