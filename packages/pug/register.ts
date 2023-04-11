// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("./");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const resolvedPug = JSON.stringify(require.resolve("./"));

function compileTemplate(module: any, filename: any) {
	const template = pug.compileFileClient(filename, {
		inlineRuntimeFunctions: false,
	});
	const body = `var pug = require(${resolvedPug}).runtime;\n\n` + `module.exports = ${template};`;
	module._compile(body, filename);
}

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
if (require.extensions) {
	// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
	require.extensions[".pug"] = compileTemplate;
}
