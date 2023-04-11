/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");

// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
pug.renderFile(`${__dirname}/layout.pug`, { debug: true }, (err: any, html: any) => {
	if (err) throw err;
	console.log(html);
});
