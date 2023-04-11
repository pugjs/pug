/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
	path = `${__dirname}/mixins.pug`,
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'str'.
	str = require("fs").readFileSync(path, "utf8"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fn'.
	fn = pug.compile(str, { filename: path, pretty: true });

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'user'.
const user = {
	name: "tj",
	pets: ["tobi", "loki", "jane", "manny"],
};

console.log(fn({ user }));
