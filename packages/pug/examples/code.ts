/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
	path = `${__dirname}/code.pug`,
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'str'.
	str = require("fs").readFileSync(path, "utf8"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fn'.
	fn = pug.compile(str, { filename: path, pretty: true });

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'users'.
const users = {
	tj: { age: 23, email: "tj@vision-media.ca", isA: "human" },
	tobi: { age: 1, email: "tobi@is-amazing.com", isA: "ferret" },
};

console.log(fn({ users }));
