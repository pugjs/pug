// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
const parse = require("../");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'testCases'... Remove this comment to see the full error message
const testCases = fs.readdirSync(`${__dirname}/cases`).filter((name: any) => {
	return name.endsWith(".tokens.json");
});

function parseNewlineJson(str: any) {
	return str.split("\n").filter(Boolean).map(JSON.parse);
}

function read(path: any) {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	return fs.readFileSync(`${__dirname}/cases/${path}`, "utf8");
}

// @ts-expect-error TS(7005): Variable 'testCases' implicitly has an 'any' type.
testCases.forEach((filename: any) => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test(filename, () => {
		const actualAst = parse(parseNewlineJson(read(filename)), {
			filename,
		});
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(actualAst).toMatchSnapshot();
	});
});
