/**
 * Module dependencies.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");

const locals = {
	users: {
		tj: { age: 23, email: "tj@vision-media.ca", isA: "human" },
		tobi: { age: 1, email: "tobi@is-amazing.com", isA: "ferret" },
	},
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fn'.
const fn = pug.compileFile(`${__dirname}/dynamicscript.pug`);
console.log(fn(locals));
