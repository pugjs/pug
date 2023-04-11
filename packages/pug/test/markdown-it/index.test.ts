const pug = require('../../');

test('inline and include markdow-it should match ', () => {
  const outputMarkdownInline = pug.renderFile(
    __dirname + '/layout-markdown-inline.pug'
  );

  const outputMarkdownIncludes = pug.renderFile(
    __dirname + '/layout-markdown-include.pug'
  );

  expect(outputMarkdownIncludes).toEqual(outputMarkdownInline);
});
