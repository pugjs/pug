// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../../");

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("inline and include markdow-it should match", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const outputMarkdownInline = pug.renderFile(`${__dirname}/layout-markdown-inline.pug`);

	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const outputMarkdownIncludes = pug.renderFile(`${__dirname}/layout-markdown-include.pug`);

	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(outputMarkdownIncludes).toEqual(outputMarkdownInline);
});
