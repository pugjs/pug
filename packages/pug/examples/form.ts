/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
	path = `${__dirname}/form.pug`,
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'str'.
	str = require("fs").readFileSync(path, "utf8"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fn'.
	fn = pug.compile(str, { filename: path, pretty: true });

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'user'.
const user = {
	name: "TJ",
	email: "tj@vision-media.ca",
	city: "Victoria",
	province: "BC",
};

console.log(fn({ user }));
