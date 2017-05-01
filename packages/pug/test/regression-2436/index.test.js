const pug = require('../../');

test('#2436 - block with a same name extends from the same layout in nesting', () => {
    const output = pug.renderFile(
        __dirname + '/issue1.pug',
        {pretty: true}
    );
    expect(output).toMatchSnapshot();
});

test('#2436 - block with a same name extends from different layout in nesting', () => {
    const output = pug.renderFile(
        __dirname + '/issue2.pug',
        {pretty: true}
    );
    expect(output).toMatchSnapshot();
});
