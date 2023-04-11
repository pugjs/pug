/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
	path = `${__dirname}/extend.pug`,
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'str'.
	str = require("fs").readFileSync(path, "utf8"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fn'.
	fn = pug.compile(str, { filename: path, pretty: true });

const tobi = { name: "tobi", age: 2 };
const loki = { name: "loki", age: 1 };
const jane = { name: "jane", age: 5 };

console.log(
	fn({
		title: "pets",
		pets: [tobi, loki, jane],
	})
);
