// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
const pug = require("../");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'uglify'.
const uglify = require("uglify-js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'mkdirp'.
const mkdirp = require("mkdirp").sync;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'filters'.
const filters = {
	custom(str: any, options: any) {
		assert(options.opt === "val");
		assert(options.num === 2);
		return `BEGIN${str}END`;
	},
};

// test cases

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'writeFileS... Remove this comment to see the full error message
function writeFileSync(filename: any, data: any) {
	try {
		if (fs.readFileSync(filename, "utf8") === data.toString("utf8")) {
			return;
		}
	} catch (ex) {
		// @ts-expect-error TS(2571): Object is of type 'unknown'.
		if (ex.code !== "ENOENT") {
			throw ex;
		}
	}
	fs.writeFileSync(filename, data);
}

function findCases(dir: any) {
	return fs
		.readdirSync(dir)
		.filter((file: any) => {
			return ~file.indexOf(".pug");
		})
		.map((file: any) => {
			return file.replace(".pug", "");
		});
}

function testSingle(it: any, suffix: any, test: any) {
	const name = test.replace(/[-.]/g, " ");
	it(name, () => {
		// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
		const path = `${__dirname}/cases${suffix}/${test}.pug`;
		const str = fs.readFileSync(path, "utf8");
		const fn = pug.compile(str, {
			filename: path,
			pretty: true,
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			basedir: `${__dirname}/cases${suffix}`,
			filters,
			filterAliases: { markdown: "markdown-it" },
		});
		let actual = fn({ title: "Pug" });

		// @ts-expect-error TS(2304): Cannot find name '__dirname'.
		writeFileSync(`${__dirname}/output${suffix}/${test}.html`, actual);

		// @ts-expect-error TS(2304): Cannot find name '__dirname'.
		let html = fs.readFileSync(`${__dirname}/cases${suffix}/${test}.html`, "utf8").trim().replace(/\r/g, "");
		const clientCode = uglify.minify(
			pug.compileClient(str, {
				filename: path,
				pretty: true,
				compileDebug: false,
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				basedir: `${__dirname}/cases${suffix}`,
				filters,
				filterAliases: { markdown: "markdown-it" },
			}),
			{
				output: { beautify: true },
				mangle: false,
				compress: false,
				fromString: true,
			}
		).code;
		const clientCodeDebug = uglify.minify(
			pug.compileClient(str, {
				filename: path,
				pretty: true,
				compileDebug: true,
				// @ts-expect-error TS(2304): Cannot find name '__dirname'.
				basedir: `${__dirname}/cases${suffix}`,
				filters,
				filterAliases: { markdown: "markdown-it" },
			}),
			{
				output: { beautify: true },
				mangle: false,
				compress: false,
				fromString: true,
			}
		).code;
		writeFileSync(
			// @ts-expect-error TS(2304): Cannot find name '__dirname'.
			`${__dirname}/output${suffix}/${test}.js`,
			uglify.minify(
				pug.compileClient(str, {
					filename: path,
					pretty: false,
					compileDebug: false,
					// @ts-expect-error TS(2304): Cannot find name '__dirname'.
					basedir: `${__dirname}/cases${suffix}`,
					filters,
					filterAliases: { markdown: "markdown-it" },
				}),
				{
					output: { beautify: true },
					mangle: false,
					compress: false,
					fromString: true,
				}
			).code
		);
		if (/filter/.test(test)) {
			actual = actual.replace(/\n| /g, "");
			html = html.replace(/\n| /g, "");
		}
		if (/mixins-unused/.test(test)) {
			assert(/never-called/.test(str), "never-called is in the pug file for mixins-unused");
			assert(!/never-called/.test(clientCode), "never-called should be removed from the code");
		}
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(actual.trim()).toEqual(html);
		actual = Function("pug", `${clientCode}\nreturn template;`)()({
			title: "Pug",
		});
		if (/filter/.test(test)) {
			actual = actual.replace(/\n| /g, "");
		}
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(actual.trim()).toEqual(html);
		actual = Function("pug", `${clientCodeDebug}\nreturn template;`)()({
			title: "Pug",
		});
		if (/filter/.test(test)) {
			actual = actual.replace(/\n| /g, "");
		}
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(actual.trim()).toEqual(html);
	});
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
	filters,
	findCases,
	testSingle,
};
