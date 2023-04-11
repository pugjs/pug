// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'lex'.
const lex = require("pug-lexer");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
const parse = require("pug-parser");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'walk'.
const walk = require("../");

// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("simple", () => {
	const ast = walk(
		parse(lex(".my-class foo")),
		(node: any, replace: any) => {
			// called before walking the children of `node`
			// to replace the node, call `replace(newNode)`
			// return `false` to skip descending
			if (node.type === "Text") {
				replace({
					type: "Text",
					val: "bar",
					line: node.line,
					column: node.column,
				});
			}
		},
		// @ts-expect-error TS(6133): 'node' is declared but its value is never read.
		(node: any, replace: any) => {
			// called before walking the children of `node`
			// to replace the node, call `replace(newNode)`
		}
	);
	// @ts-expect-error TS(2304): Cannot find name 'expect'.
	expect(ast).toEqual(parse(lex(".my-class bar")));
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("replace([])", () => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("block flattening", () => {
		const called: any = [];
		const ast = walk(
			{
				type: "Block",
				nodes: [
					{
						type: "Block",
						nodes: [
							{
								type: "Block",
								nodes: [
									{
										type: "Text",
										val: "a",
									},
									{
										type: "Text",
										val: "b",
									},
								],
							},
							{
								type: "Text",
								val: "c",
							},
						],
					},
					{
						type: "Text",
						val: "d",
					},
				],
			},
			(node: any, replace: any) => {
				if (node.type === "Text") {
					called.push(`before ${node.val}`);
					if (node.val === "a") {
						assert(replace.arrayAllowed, "replace.arrayAllowed set wrongly");
						replace([
							{
								type: "Text",
								val: "e",
							},
							{
								type: "Text",
								val: "f",
							},
						]);
					}
				}
			},
			(node: any, replace: any) => {
				if (node.type === "Block" && replace.arrayAllowed) {
					replace(node.nodes);
				} else if (node.type === "Text") {
					called.push(`after ${node.val}`);
				}
			}
		);

		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(ast).toEqual({
			type: "Block",
			nodes: [
				{ type: "Text", val: "e" },
				{ type: "Text", val: "f" },
				{ type: "Text", val: "b" },
				{ type: "Text", val: "c" },
				{ type: "Text", val: "d" },
			],
		});

		assert.deepEqual(
			called,
			[
				"before a",

				"before e",
				"after e",

				"before f",
				"after f",

				"before b",
				"after b",

				"before c",
				"after c",

				"before d",
				"after d",
			],
			`before() and after() called incorrectly: ${JSON.stringify(called)}`
		);
	});

	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("adding include filters", () => {
		const ast = walk(parse(lex("include:filter1:filter2 file")), (node: any, replace: any) => {
			if (node.type === "IncludeFilter") {
				assert(replace.arrayAllowed);
				if (node.name === "filter1") {
					const firstFilter = "filter3";

					replace([
						{
							type: "IncludeFilter",
							name: firstFilter,
							attrs: [],
							line: node.line,
							column: node.column,
						},
						{
							type: "IncludeFilter",
							name: "filter4",
							attrs: [],
							line: node.line,
							column: node.column + firstFilter.length + 1,
						},
					]);
				} else if (node.name === "filter2") {
					replace([]);
				}
			}
		});

		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(ast).toEqual(parse(lex("include:filter3:filter4 file")));
	});

	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("fails when parent is not Block", () => {
		walk(parse(lex("p content")), (node: any, replace: any) => {
			if (node.type === "Block" && node.nodes[0] && node.nodes[0].type === "Text") {
				assert(!replace.arrayAllowed, "replace.arrayAllowed set wrongly");
				assert.throws(() => {
					replace([]);
				});
			}
		});
	});
});
