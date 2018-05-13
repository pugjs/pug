const pug = require('../../');

test('layout with duplicate block', () => {
  const outputWithAjax = pug.renderFile(
    __dirname + '/index.pug',
    {ajax: true}
  );
  const outputWithoutAjax = pug.renderFile(
    __dirname + '/index.pug',
    {ajax: false}
  );
  expect(outputWithAjax).toMatchSnapshot();
  expect(outputWithoutAjax).toMatchSnapshot();
});
