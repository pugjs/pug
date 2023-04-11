// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const acorn = require("acorn");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'walk'.
const walk = require("acorn-walk");

let hadErrors = false;

const lexerFunctions = {
	advance: true,
	append: true,
	attributesBlock: true,
	attrs: true,
	blank: true,
	block: true,
	blockCode: true,
	call: true,
	case: true,
	className: true,
	code: true,
	colon: true,
	comment: true,
	conditional: true,
	default: true,
	doctype: true,
	dot: true,
	each: true,
	eachOf: true,
	eos: true,
	endInterpolation: true,
	extends: true,
	filter: true,
	id: true,
	include: true,
	indent: true,
	interpolation: true,
	isExpression: true,
	mixin: true,
	mixinBlock: true,
	path: true,
	pipelessText: true,
	prepend: true,
	slash: true,
	tag: true,
	text: true,
	textHtml: true,
	when: true,
	while: true,
	yield: true,
};

function checkDirectCalls(node: any) {
	const callee = node.callee;
	if (callee.type !== "MemberExpression") return;
	if (callee.object.type !== "ThisExpression") return;
	const property = callee.property;
	let func;
	if (callee.computed) {
		if (property.type !== "Literal") return;
		func = property.value;
	} else {
		func = property.name;
	}
	// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
	if (!lexerFunctions[func]) return;
	console.log(`index.js:${node.loc.start.line}:${node.loc.start.column}: Lexer function ${func} called directly`);
	hadErrors = true;
}

function checkMissingLexerFunction(node: any) {
	const callee = node.callee;
	if (callee.type !== "MemberExpression") return;
	if (callee.object.type !== "ThisExpression") return;
	const property = callee.property;
	let func;
	if (callee.computed) {
		if (property.type !== "Literal") return;
		func = property.value;
	} else {
		func = property.name;
	}
	if (func !== "callLexerFunction") return;
	if (!node.arguments.length) return;
	if (node.arguments[0].type !== "Literal") return;
	func = node.arguments[0].value;
	// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
	if (lexerFunctions[func]) return;
	console.log(
		`index.js:${node.loc.start.line}:${node.loc.start.column}: Lexer function ${func} not in lexerFunctions list`
	);
	hadErrors = true;
}
// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
test("lexer functions", () => {
	// @ts-expect-error TS(2552): Cannot find name '__dirname'. Did you mean 'dirnam... Remove this comment to see the full error message
	const str = fs.readFileSync(`${__dirname}/../index.js`, "utf8");
	const ast = acorn.parse(str, { locations: true });
	walk.simple(ast, {
		CallExpression(node: any) {
			checkDirectCalls(node);
			checkMissingLexerFunction(node);
		},
	});
	if (hadErrors) {
		throw new Error("Problem with lexer functions detected");
	}
});
