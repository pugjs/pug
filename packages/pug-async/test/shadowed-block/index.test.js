const pug = require('../../');

test('layout with shadowed block', () => {
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
