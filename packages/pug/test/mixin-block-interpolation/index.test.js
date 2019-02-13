const pug = require('../../');

test('mixin block tag interpolation', () => {
    const output = pug.renderFile(
        __dirname + '/index.pug',
        {pretty: true}
    );
    expect(output).toMatchSnapshot();
});