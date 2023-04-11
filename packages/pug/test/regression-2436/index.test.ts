// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../../");

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("#2436 - block with a same name extends from the same layout in nesting", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const output = pug.renderFile(`${__dirname}/issue1.pug`, { pretty: true });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(output).toMatchSnapshot();
});

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("#2436 - block with a same name extends from different layout in nesting", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const output = pug.renderFile(`${__dirname}/issue2.pug`, { pretty: true });
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(output).toMatchSnapshot();
});
