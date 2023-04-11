// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'uglify'.
const uglify = require("uglify-js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'runtime'.
const runtime = require("./");

try {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	fs.mkdirSync(`${__dirname}/lib`);
} catch (ex) {
	// @ts-expect-error TS(2571): Object is of type 'unknown'.
	if (ex.code !== "EEXIST") throw ex;
}
// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
const source = fs.readFileSync(`${__dirname}/index.js`, "utf8");
const ast = uglify.parse(source);

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dependenci... Remove this comment to see the full error message
const dependencies = {};
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'internals'... Remove this comment to see the full error message
const internals = { dependencies: true, internals: true };
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sources'.
const sources = {};
ast.body.forEach((node: any) => {
	let name;
	switch (node.TYPE) {
		case "Defun":
			name = node.name.name;
			break;
		case "Var":
			name = node.definitions[0].name.name;
			break;
	}
	if (!name || !name.startsWith("pug_")) return;
	name = name.replace(/^pug\_/, "");

	const src = uglify.minify(source.substring(node.start.pos, node.end.endpos), {
		fromString: true,
	}).code;
	sources[name] = src;

	dependencies[name] = [];
	if (node.TYPE === "Defun") {
		const ast = uglify.parse(src);
		ast.figure_out_scope();
		// @ts-expect-error TS(6133): 'val' is declared but its value is never read.
		const globals = ast.globals.map((val: any, key: any) => {
			return key;
		});
		dependencies[name] = globals
			.filter((key: any) => {
				return key.startsWith("pug_");
			})
			.map((key: any) => {
				return key.replace(/^pug\_/, "");
			});
	}

	if (!runtime[name]) internals[name] = true;
});

Object.keys(dependencies).forEach((fn) => {
	dependencies[fn] = dependencies[fn].sort();
});

// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
fs.writeFileSync(`${__dirname}/lib/dependencies.js`, `module.exports = ${JSON.stringify(dependencies, null, 2)}\n`);
// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
fs.writeFileSync(`${__dirname}/lib/internals.js`, `module.exports = ${JSON.stringify(internals, null, 2)}\n`);
// @ts-expect-error TS(2304): Cannot find name '__dirname'.
fs.writeFileSync(`${__dirname}/lib/sources.js`, `module.exports = ${JSON.stringify(sources, null, 2)}\n`);
