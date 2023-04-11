// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dirname'.
const dirname = require("path").dirname;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'constantin... Remove this comment to see the full error message
const constantinople = require("constantinople");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'walk'.
const walk = require("pug-walk");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'error'.
const error = require("pug-error");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const runFilter = require("./run-filter");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = handleFilters;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handleFilt... Remove this comment to see the full error message
function handleFilters(ast: any, filters: any, options: any, filterAliases: any) {
	options = options || {};
	walk(
		ast,
		(node: any) => {
			const dir = node.filename ? dirname(node.filename) : null;
			if (node.type === "Filter") {
				handleNestedFilters(node, filters, options, filterAliases);
				const text = getBodyAsText(node);
				var attrs = getAttributes(node, options);
				// @ts-expect-error TS(2339): Property 'filename' does not exist on type '{}'.
				attrs.filename = node.filename;
				node.type = "Text";
				// @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
				node.val = filterWithFallback(node, text, attrs);
			} else if (node.type === "RawInclude" && node.filters.length) {
				const firstFilter = node.filters.pop();
				var attrs = getAttributes(firstFilter, options);
				// @ts-expect-error TS(2339): Property 'filename' does not exist on type '{}'.
				const filename = (attrs.filename = node.file.fullPath);
				node.type = "Text";
				node.val = filterFileWithFallback(firstFilter, filename, node.file, attrs);
				node.filters
					.slice()
					.reverse()
					.forEach((filter: any) => {
						const attrs = getAttributes(filter, options);
						// @ts-expect-error TS(2339): Property 'filename' does not exist on type '{}'.
						attrs.filename = filename;
						// @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
						node.val = filterWithFallback(filter, node.val, attrs);
					});
				node.filters = undefined;
				node.file = undefined;
			}

			function filterWithFallback(filter: any, text: any, attrs: any, funcName: any) {
				try {
					const filterName = getFilterName(filter);
					if (filters && filters[filterName]) {
						return filters[filterName](text, attrs);
					}
					return runFilter(filterName, text, attrs, dir, funcName);
				} catch (ex) {
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					if (ex.code === "UNKNOWN_FILTER") {
						// @ts-expect-error TS(2571): Object is of type 'unknown'.
						throw error(ex.code, ex.message, filter);
					}
					throw ex;
				}
			}

			function filterFileWithFallback(filter: any, filename: any, file: any, attrs: any) {
				const filterName = getFilterName(filter);
				if (filters && filters[filterName]) {
					if (filters[filterName].renderBuffer) {
						return filters[filterName].renderBuffer(file.raw, attrs);
					}
					return filters[filterName](file.str, attrs);
				}
				return filterWithFallback(filter, filename, attrs, "renderFile");
			}
		},
		{ includeDependencies: true }
	);
	function getFilterName(filter: any) {
		let filterName = filter.name;
		if (filterAliases && filterAliases[filterName]) {
			filterName = filterAliases[filterName];
			if (filterAliases[filterName]) {
				throw error(
					"FILTER_ALISE_CHAIN",
					`The filter "${filter.name}" is an alias for "${filterName}", which is an alias for "${filterAliases[filterName]}".  Pug does not support chains of filter aliases.`,
					filter
				);
			}
		}
		return filterName;
	}
	return ast;
}

function handleNestedFilters(node: any, filters: any, options: any, filterAliases: any) {
	if (node.block.nodes[0] && node.block.nodes[0].type === "Filter") {
		node.block.nodes[0] = handleFilters(node.block, filters, options, filterAliases).nodes[0];
	}
}

function getBodyAsText(node: any) {
	return node.block.nodes
		.map((node: any) => {
			return node.val;
		})
		.join("");
}

function getAttributes(node: any, options: any) {
	const attrs = {};
	node.attrs.forEach((attr: any) => {
		try {
			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			attrs[attr.name] = attr.val === true ? true : constantinople.toConstant(attr.val);
		} catch (ex) {
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			if (/not constant/.test(ex.message)) {
				throw error(
					"FILTER_OPTION_NOT_CONSTANT",
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					`${ex.message} All filters are rendered compile-time so filter options must be constants.`,
					node
				);
			}
			throw ex;
		}
	});
	const opts = options[node.name] || {};
	Object.keys(opts).forEach((opt) => {
		if (!attrs.hasOwnProperty(opt)) {
			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			attrs[opt] = opts[opt];
		}
	});
	return attrs;
}
