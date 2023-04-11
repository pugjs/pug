// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'walk'.
const walk = require("pug-walk");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'error'.
function error() {
	// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
	throw require("pug-error").apply(null, arguments);
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = link;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'link'.
function link(ast: any) {
	assert(ast.type === "Block", "The top level element should always be a block");
	let extendsNode = null;
	if (ast.nodes.length) {
		const hasExtends = ast.nodes[0].type === "Extends";
		checkExtendPosition(ast, hasExtends);
		if (hasExtends) {
			extendsNode = ast.nodes.shift();
		}
	}
	// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
	ast = applyIncludes(ast);
	ast.declaredBlocks = findDeclaredBlocks(ast);
	if (extendsNode) {
		const mixins: any = [];
		const expectedBlocks: any = [];
		ast.nodes.forEach(function addNode(node: any) {
			if (node.type === "NamedBlock") {
				expectedBlocks.push(node);
			} else if (node.type === "Block") {
				node.nodes.forEach(addNode);
			} else if (node.type === "Mixin" && node.call === false) {
				mixins.push(node);
			} else {
				error(
					"UNEXPECTED_NODES_IN_EXTENDING_ROOT",
					"Only named blocks and mixins can appear at the top level of an extending template",
					node
				);
			}
		});
		const parent = link(extendsNode.file.ast);
		extend(parent.declaredBlocks, ast);
		const foundBlockNames: any = [];
		walk(parent, (node: any) => {
			if (node.type === "NamedBlock") {
				foundBlockNames.push(node.name);
			}
		});
		// @ts-expect-error TS(7006): Parameter 'expectedBlock' implicitly has an 'any' ... Remove this comment to see the full error message
		expectedBlocks.forEach((expectedBlock) => {
			if (foundBlockNames.indexOf(expectedBlock.name) === -1) {
				error("UNEXPECTED_BLOCK", `Unexpected block ${expectedBlock.name}`, expectedBlock);
			}
		});
		Object.keys(ast.declaredBlocks).forEach((name) => {
			parent.declaredBlocks[name] = ast.declaredBlocks[name];
		});
		parent.nodes = mixins.concat(parent.nodes);
		parent.hasExtends = true;
		return parent;
	}
	return ast;
}

function findDeclaredBlocks(ast: any) /*: {[name: string]: Array<BlockNode>}*/ {
	const definitions = {};
	walk(ast, (node: any) => {
		if (node.type === "NamedBlock" && node.mode === "replace") {
			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			definitions[node.name] = definitions[node.name] || [];
			// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
			definitions[node.name].push(node);
		}
	});
	return definitions;
}

function flattenParentBlocks(parentBlocks: any, accumulator: any) {
	accumulator = accumulator || [];
	parentBlocks.forEach((parentBlock: any) => {
		if (parentBlock.parents) {
			flattenParentBlocks(parentBlock.parents, accumulator);
		}
		accumulator.push(parentBlock);
	});
	return accumulator;
}

function extend(parentBlocks: any, ast: any) {
	const stack = {};
	walk(
		ast,
		(node: any) => {
			if (node.type === "NamedBlock") {
				// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				if (stack[node.name] === node.name) {
					return (node.ignore = true);
				}
				// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				stack[node.name] = node.name;
				// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
				const parentBlockList = parentBlocks[node.name] ? flattenParentBlocks(parentBlocks[node.name]) : [];
				if (parentBlockList.length) {
					node.parents = parentBlockList;
					parentBlockList.forEach((parentBlock: any) => {
						switch (node.mode) {
							case "append":
								parentBlock.nodes = parentBlock.nodes.concat(node.nodes);
								break;
							case "prepend":
								parentBlock.nodes = node.nodes.concat(parentBlock.nodes);
								break;
							case "replace":
								parentBlock.nodes = node.nodes;
								break;
						}
					});
				}
			}
		},
		(node: any) => {
			if (node.type === "NamedBlock" && !node.ignore) {
				// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
				delete stack[node.name];
			}
		}
	);
}

// @ts-expect-error TS(6133): 'child' is declared but its value is never read.
function applyIncludes(ast: any, child: any) {
	return walk(
		ast,
		(node: any, replace: any) => {
			if (node.type === "RawInclude") {
				replace({ type: "Text", val: node.file.str.replace(/\r/g, "") });
			}
		},
		(node: any, replace: any) => {
			if (node.type === "Include") {
				let childAST = link(node.file.ast);
				if (childAST.hasExtends) {
					childAST = removeBlocks(childAST);
				}
				replace(applyYield(childAST, node.block));
			}
		}
	);
}
function removeBlocks(ast: any) {
	return walk(ast, (node: any, replace: any) => {
		if (node.type === "NamedBlock") {
			replace({
				type: "Block",
				nodes: node.nodes,
			});
		}
	});
}

function applyYield(ast: any, block: any) {
	if (!block || !block.nodes.length) return ast;
	let replaced = false;
	// @ts-expect-error TS(6133): 'replace' is declared but its value is never read.
	ast = walk(ast, null, (node: any, replace: any) => {
		if (node.type === "YieldBlock") {
			replaced = true;
			node.type = "Block";
			node.nodes = [block];
		}
	});
	function defaultYieldLocation(node: any) {
		let res = node;
		for (let i = 0; i < node.nodes.length; i++) {
			if (node.nodes[i].textOnly) continue;
			if (node.nodes[i].type === "Block") {
				res = defaultYieldLocation(node.nodes[i]);
			} else if (node.nodes[i].block && node.nodes[i].block.nodes.length) {
				res = defaultYieldLocation(node.nodes[i].block);
			}
		}
		return res;
	}
	if (!replaced) {
		// todo: probably should deprecate this with a warning
		defaultYieldLocation(ast).nodes.push(block);
	}
	return ast;
}

function checkExtendPosition(ast: any, hasExtends: any) {
	let legitExtendsReached = false;
	walk(ast, (node: any) => {
		if (node.type === "Extends") {
			if (hasExtends && !legitExtendsReached) {
				legitExtendsReached = true;
			} else {
				error(
					"EXTENDS_NOT_FIRST",
					'Declaration of template inheritance ("extends") should be the first thing in the file. There can only be one extends statement per file.',
					node
				);
			}
		}
	});
}
