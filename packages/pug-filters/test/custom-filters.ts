// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
	custom(str: any, options: any) {
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(options.opt).toBe("val");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(options.num).toBe(2);
		return `BEGIN${str}END`;
	},
};
