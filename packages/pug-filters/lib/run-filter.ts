// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const jstransformer = require("jstransformer");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'resolve'.
const resolve = require("resolve");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = filter;

function getMinifyTransformerName(outputFormat: any) {
	switch (outputFormat) {
		case "js":
			return "uglify-js";
		case "css":
			return "clean-css";
	}
}

function filter(name: any, str: any, options: any, currentDirectory: any, funcName: any) {
	funcName = funcName || "render";
	let trPath;
	try {
		try {
			trPath = resolve.sync(`jstransformer-${name}`, {
				// @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
				basedir: currentDirectory || process.cwd(),
			});
		} catch (ex) {
			// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
			trPath = require.resolve(`jstransformer-${name}`);
		}
	} catch (ex) {
		const err = new Error(`unknown filter ":${name}"`);
		// @ts-expect-error TS(2339): Property 'code' does not exist on type 'Error'.
		err.code = "UNKNOWN_FILTER";
		throw err;
	}
	// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
	const tr = jstransformer(require(trPath));
	// TODO: we may want to add a way for people to separately specify "locals"
	let result = tr[funcName](str, options, options).body;
	if (options && options.minify) {
		const minifyTranformer = getMinifyTransformerName(tr.outputFormat);
		if (minifyTranformer) {
			try {
				// @ts-expect-error TS(2554): Expected 5 arguments, but got 4.
				result = filter(minifyTranformer, result, null, currentDirectory);
			} catch (ex) {
				// better to fail to minify than output nothing
			}
		}
	}
	return result;
}
