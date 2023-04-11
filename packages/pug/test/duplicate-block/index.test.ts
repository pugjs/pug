// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../../");

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("layout with duplicate block", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const outputWithAjax = pug.renderFile(`${__dirname}/index.pug`, { ajax: true });
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const outputWithoutAjax = pug.renderFile(`${__dirname}/index.pug`, {
		ajax: false,
	});
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(outputWithAjax).toMatchSnapshot();
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(outputWithoutAjax).toMatchSnapshot();
});
