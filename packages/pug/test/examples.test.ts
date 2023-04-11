// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("examples", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	fs.readdirSync(`${__dirname}/../examples`).forEach((example: any) => {
		if (example.endsWith(".js")) {
			// @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
			it(`${example} does not throw any error`, () => {
				const log = console.log;
				const err = console.error;
				console.log = function () {};
				console.error = function () {};
				try {
					// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
					require(`../examples/${example}`);
				} finally {
					console.log = log;
					console.error = err;
				}
			});
		}
	});
});
