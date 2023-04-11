/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
	path = `${__dirname}/rss.pug`,
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'str'.
	str = require("fs").readFileSync(path, "utf8"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fn'.
	fn = pug.compile(str, { filename: path, pretty: true });

const items = [];

items.push({
	title: "Example",
	description: "Something",
	link: "http://google.com",
});
items.push({
	title: "LearnBoost",
	description: "Cool",
	link: "http://learnboost.com",
});
items.push({
	title: "Express",
	description: "Cool",
	link: "http://expressjs.com",
});

console.log(fn({ items }));
