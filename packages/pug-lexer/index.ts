// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const isExpression = require("is-expression");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const characterParser = require("character-parser");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'error'.
const error = require("pug-error");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = lex;
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.Lexer = Lexer;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'lex'.
function lex(str: any, options: any) {
	// @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
	const lexer = new Lexer(str, options);
	return JSON.parse(JSON.stringify(lexer.getTokens()));
}

/**
 * Initialize `Lexer` with the given `str`.
 *
 * @param {String} str
 * @param {String} filename
 * @api private
 */

function Lexer(this: any, str: any, options: any) {
	options = options || {};
	if (typeof str !== "string") {
		throw new Error(`Expected source code to be a string but got "${typeof str}"`);
	}
	if (typeof options !== "object") {
		throw new Error(`Expected "options" to be an object but got "${typeof options}"`);
	}
	//Strip any UTF-8 BOM off of the start of `str`, if it exists.
	str = str.replace(/^\uFEFF/, "");
	this.input = str.replace(/\r\n|\r/g, "\n");
	this.originalInput = this.input;
	this.filename = options.filename;
	this.interpolated = options.interpolated || false;
	this.lineno = options.startingLine || 1;
	this.colno = options.startingColumn || 1;
	this.plugins = options.plugins || [];
	this.indentStack = [0];
	this.indentRe = null;
	// If #{}, !{} or #[] syntax is allowed when adding text
	this.interpolationAllowed = true;
	this.whitespaceRe = /[ \n\t]/;

	this.tokens = [];
	this.ended = false;
}

/**
 * Lexer prototype.
 */

Lexer.prototype = {
	constructor: Lexer,

	error(code: any, message: any) {
		const err = error(code, message, {
			line: this.lineno,
			column: this.colno,
			filename: this.filename,
			src: this.originalInput,
		});
		throw err;
	},

	assert(value: any, message: any) {
		if (!value) this.error("ASSERT_FAILED", message);
	},

	isExpression(exp: any) {
		return isExpression(exp, {
			throw: true,
		});
	},

	assertExpression(exp: any, noThrow: any) {
		//this verifies that a JavaScript expression is valid
		try {
			this.callLexerFunction("isExpression", exp);
			return true;
		} catch (ex) {
			if (noThrow) return false;

			// not coming from acorn
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			if (!ex.loc) throw ex;

			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			this.incrementLine(ex.loc.line - 1);
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			this.incrementColumn(ex.loc.column);
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			const msg = `Syntax Error: ${ex.message.replace(/ \([0-9]+:[0-9]+\)$/, "")}`;
			this.error("SYNTAX_ERROR", msg);
		}
	},

	assertNestingCorrect(exp: any) {
		//this verifies that code is properly nested, but allows
		//invalid JavaScript such as the contents of `attributes`
		const res = characterParser.default(exp);
		if (res.isNesting()) {
			this.error("INCORRECT_NESTING", `Nesting must match on expression \`${exp}\``);
		}
	},

	/**
	 * Construct a token with the given `type` and `val`.
	 *
	 * @param {String} type
	 * @param {String} val
	 * @return {Object}
	 * @api private
	 */

	tok(type: any, val: any) {
		const res = {
			type,
			loc: {
				start: {
					line: this.lineno,
					column: this.colno,
				},
				filename: this.filename,
			},
		};

		// @ts-expect-error TS(2339): Property 'val' does not exist on type '{ type: any... Remove this comment to see the full error message
		if (val !== undefined) res.val = val;

		return res;
	},

	/**
	 * Set the token's `loc.end` value.
	 *
	 * @param {Object} tok
	 * @returns {Object}
	 * @api private
	 */

	tokEnd(tok: any) {
		tok.loc.end = {
			line: this.lineno,
			column: this.colno,
		};
		return tok;
	},

	/**
	 * Increment `this.lineno` and reset `this.colno`.
	 *
	 * @param {Number} increment
	 * @api private
	 */

	incrementLine(increment: any) {
		this.lineno += increment;
		if (increment) this.colno = 1;
	},

	/**
	 * Increment `this.colno`.
	 *
	 * @param {Number} increment
	 * @api private
	 */

	incrementColumn(increment: any) {
		this.colno += increment;
	},

	/**
	 * Consume the given `len` of input.
	 *
	 * @param {Number} len
	 * @api private
	 */

	consume(len: any) {
		this.input = this.input.substr(len);
	},

	/**
	 * Scan for `type` with the given `regexp`.
	 *
	 * @param {String} type
	 * @param {RegExp} regexp
	 * @return {Object}
	 * @api private
	 */

	scan(regexp: any, type: any) {
		let captures;
		if ((captures = regexp.exec(this.input))) {
			const len = captures[0].length;
			const val = captures[1];
			const diff = len - (val ? val.length : 0);
			const tok = this.tok(type, val);
			this.consume(len);
			this.incrementColumn(diff);
			return tok;
		}
	},
	scanEndOfLine(regexp: any, type: any) {
		let captures;
		if ((captures = regexp.exec(this.input))) {
			let whitespaceLength = 0;
			let whitespace;
			let tok;
			if ((whitespace = /^([ ]+)([^ ]*)/.exec(captures[0]))) {
				whitespaceLength = whitespace[1].length;
				this.incrementColumn(whitespaceLength);
			}
			const newInput = this.input.substr(captures[0].length);
			if (newInput[0] === ":") {
				this.input = newInput;
				tok = this.tok(type, captures[1]);
				this.incrementColumn(captures[0].length - whitespaceLength);
				return tok;
			}
			if (/^[ \t]*(\n|$)/.test(newInput)) {
				// @ts-expect-error TS(2531): Object is possibly 'null'.
				this.input = newInput.substr(/^[ \t]*/.exec(newInput)[0].length);
				tok = this.tok(type, captures[1]);
				this.incrementColumn(captures[0].length - whitespaceLength);
				return tok;
			}
		}
	},

	/**
	 * Return the indexOf `(` or `{` or `[` / `)` or `}` or `]` delimiters.
	 *
	 * Make sure that when calling this function, colno is at the character
	 * immediately before the beginning.
	 *
	 * @return {Number}
	 * @api private
	 */

	bracketExpression(skip: any) {
		skip = skip || 0;
		const start = this.input[skip];
		assert(start === "(" || start === "{" || start === "[", 'The start character should be "(", "{" or "["');
		// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		const end = { "(": ")", "{": "}", "[": "]" }[start];
		let range;
		try {
			range = characterParser.parseUntil(this.input, end, { start: skip + 1 });
		} catch (ex) {
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			if (ex.index !== undefined) {
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				let idx = ex.index;
				// starting from this.input[skip]
				let tmp = this.input.substr(skip).indexOf("\n");
				// starting from this.input[0]
				let nextNewline = tmp + skip;
				let ptr = 0;
				while (idx > nextNewline && tmp !== -1) {
					this.incrementLine(1);
					idx -= nextNewline + 1;
					ptr += nextNewline + 1;
					tmp = nextNewline = this.input.substr(ptr).indexOf("\n");
				}

				this.incrementColumn(idx);
			}
			// @ts-expect-error TS(2571): Object is of type 'unknown'.
			if (ex.code === "CHARACTER_PARSER:END_OF_STRING_REACHED") {
				this.error("NO_END_BRACKET", `The end of the string reached with no closing bracket ${end} found.`);
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
			} else if (ex.code === "CHARACTER_PARSER:MISMATCHED_BRACKET") {
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				this.error("BRACKET_MISMATCH", ex.message);
			}
			throw ex;
		}
		return range;
	},

	scanIndentation() {
		let captures, re;

		// established regexp
		if (this.indentRe) {
			captures = this.indentRe.exec(this.input);
			// determine regexp
		} else {
			// tabs
			re = /^\n(\t*) */;
			captures = re.exec(this.input);

			// spaces
			if (captures && !captures[1].length) {
				re = /^\n( *)/;
				captures = re.exec(this.input);
			}

			// established
			if (captures && captures[1].length) this.indentRe = re;
		}

		return captures;
	},

	/**
	 * end-of-source.
	 */

	eos() {
		if (this.input.length) return;
		if (this.interpolated) {
			this.error("NO_END_BRACKET", "End of line was reached with no closing bracket for interpolation.");
		}
		for (let i = 0; this.indentStack[i]; i++) {
			this.tokens.push(this.tokEnd(this.tok("outdent")));
		}
		this.tokens.push(this.tokEnd(this.tok("eos")));
		this.ended = true;
		return true;
	},

	/**
	 * Blank line.
	 */

	blank() {
		let captures;
		if ((captures = /^\n[ \t]*\n/.exec(this.input))) {
			this.consume(captures[0].length - 1);
			this.incrementLine(1);
			return true;
		}
	},

	/**
	 * Comment.
	 */

	comment() {
		let captures;
		if ((captures = /^\/\/(-)?([^\n]*)/.exec(this.input))) {
			this.consume(captures[0].length);
			const tok = this.tok("comment", captures[2]);
			tok.buffer = "-" != captures[1];
			this.interpolationAllowed = tok.buffer;
			this.tokens.push(tok);
			this.incrementColumn(captures[0].length);
			this.tokEnd(tok);
			this.callLexerFunction("pipelessText");
			return true;
		}
	},

	/**
	 * Interpolated tag.
	 */

	interpolation() {
		if (this.input.startsWith("#{")) {
			const match = this.bracketExpression(1);
			this.consume(match.end + 1);
			const tok = this.tok("interpolation", match.src);
			this.tokens.push(tok);
			this.incrementColumn(2); // '#{'
			this.assertExpression(match.src);

			const splitted = match.src.split("\n");
			const lines = splitted.length - 1;
			this.incrementLine(lines);
			this.incrementColumn(splitted[lines].length + 1); // + 1 → '}'
			this.tokEnd(tok);
			return true;
		}
	},

	/**
	 * Tag.
	 */

	tag() {
		let captures;

		if ((captures = /^(\w(?:[-:\w]*\w)?)/.exec(this.input))) {
			let tok,
				name = captures[1],
				len = captures[0].length;
			this.consume(len);
			tok = this.tok("tag", name);
			this.tokens.push(tok);
			this.incrementColumn(len);
			this.tokEnd(tok);
			return true;
		}
	},

	/**
	 * Filter.
	 */

	filter(opts: any) {
		const tok = this.scan(/^:([\w\-]+)/, "filter");
		const inInclude = opts && opts.inInclude;
		if (tok) {
			this.tokens.push(tok);
			this.incrementColumn(tok.val.length);
			this.tokEnd(tok);
			this.callLexerFunction("attrs");
			if (!inInclude) {
				this.interpolationAllowed = false;
				this.callLexerFunction("pipelessText");
			}
			return true;
		}
	},

	/**
	 * Doctype.
	 */

	doctype() {
		const node = this.scanEndOfLine(/^doctype *([^\n]*)/, "doctype");
		if (node) {
			this.tokens.push(this.tokEnd(node));
			return true;
		}
	},

	/**
	 * Id.
	 */

	id() {
		const tok = this.scan(/^#([\w-]+)/, "id");
		if (tok) {
			this.tokens.push(tok);
			this.incrementColumn(tok.val.length);
			this.tokEnd(tok);
			return true;
		}
		if (this.input.startsWith("#")) {
			// @ts-expect-error TS(2531): Object is possibly 'null'.
			this.error("INVALID_ID", `"${/.[^ \t\(\#\.\:]*/.exec(this.input.substr(1))[0]}" is not a valid ID.`);
		}
	},

	/**
	 * Class.
	 */

	className() {
		const tok = this.scan(/^\.([_a-z0-9\-]*[_a-z][_a-z0-9\-]*)/i, "class");
		if (tok) {
			this.tokens.push(tok);
			this.incrementColumn(tok.val.length);
			this.tokEnd(tok);
			return true;
		}
		if (/^\.[_a-z0-9\-]+/i.test(this.input)) {
			this.error("INVALID_CLASS_NAME", "Class names must contain at least one letter or underscore.");
		}
		if (this.input.startsWith(".")) {
			this.error(
				"INVALID_CLASS_NAME",
				`"${
					// @ts-expect-error TS(2531): Object is possibly 'null'.
					/.[^ \t\(\#\.\:]*/.exec(this.input.substr(1))[0]
				}" is not a valid class name.  Class names can only contain "_", "-", a-z and 0-9, and must contain at least one of "_", or a-z`
			);
		}
	},

	/**
	 * Text.
	 */
	endInterpolation() {
		if (this.interpolated && this.input[0] === "]") {
			this.input = this.input.substr(1);
			this.ended = true;
			return true;
		}
	},
	addText(type: any, value: any, prefix: any, escaped: any) {
		let tok;
		if (value + prefix === "") return;
		prefix = prefix || "";
		escaped = escaped || 0;
		let indexOfEnd = this.interpolated ? value.indexOf("]") : -1;
		let indexOfStart = this.interpolationAllowed ? value.indexOf("#[") : -1;
		let indexOfEscaped = this.interpolationAllowed ? value.indexOf("\\#[") : -1;
		const matchOfStringInterp = /(\\)?([#!]){((?:.|\n)*)$/.exec(value);
		const indexOfStringInterp = this.interpolationAllowed && matchOfStringInterp ? matchOfStringInterp.index : Infinity;

		if (indexOfEnd === -1) indexOfEnd = Infinity;
		if (indexOfStart === -1) indexOfStart = Infinity;
		if (indexOfEscaped === -1) indexOfEscaped = Infinity;

		if (
			indexOfEscaped !== Infinity &&
			indexOfEscaped < indexOfEnd &&
			indexOfEscaped < indexOfStart &&
			indexOfEscaped < indexOfStringInterp
		) {
			prefix = `${prefix + value.substring(0, indexOfEscaped)}#[`;
			return this.addText(type, value.substring(indexOfEscaped + 3), prefix, escaped + 1);
		}
		if (
			indexOfStart !== Infinity &&
			indexOfStart < indexOfEnd &&
			indexOfStart < indexOfEscaped &&
			indexOfStart < indexOfStringInterp
		) {
			tok = this.tok(type, prefix + value.substring(0, indexOfStart));
			this.incrementColumn(prefix.length + indexOfStart + escaped);
			this.tokens.push(this.tokEnd(tok));
			tok = this.tok("start-pug-interpolation");
			this.incrementColumn(2);
			this.tokens.push(this.tokEnd(tok));
			const child = new this.constructor(value.substr(indexOfStart + 2), {
				filename: this.filename,
				interpolated: true,
				startingLine: this.lineno,
				startingColumn: this.colno,
				plugins: this.plugins,
			});
			let interpolated;
			try {
				interpolated = child.getTokens();
			} catch (ex) {
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				if (ex.code && ex.code.startsWith("PUG:")) {
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					this.colno = ex.column;
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					this.error(ex.code.substr(4), ex.msg);
				}
				throw ex;
			}
			this.colno = child.colno;
			this.tokens = this.tokens.concat(interpolated);
			tok = this.tok("end-pug-interpolation");
			this.incrementColumn(1);
			this.tokens.push(this.tokEnd(tok));
			this.addText(type, child.input);
			return;
		}
		if (
			indexOfEnd !== Infinity &&
			indexOfEnd < indexOfStart &&
			indexOfEnd < indexOfEscaped &&
			indexOfEnd < indexOfStringInterp
		) {
			if (prefix + value.substring(0, indexOfEnd)) {
				this.addText(type, value.substring(0, indexOfEnd), prefix);
			}
			this.ended = true;
			this.input = value.substr(value.indexOf("]") + 1) + this.input;
			return;
		}
		if (indexOfStringInterp !== Infinity) {
			// @ts-expect-error TS(2531): Object is possibly 'null'.
			if (matchOfStringInterp[1]) {
				// @ts-expect-error TS(2531): Object is possibly 'null'.
				prefix = `${prefix + value.substring(0, indexOfStringInterp) + matchOfStringInterp[2]}{`;
				return this.addText(type, value.substring(indexOfStringInterp + 3), prefix, escaped + 1);
			}
			let before = value.substr(0, indexOfStringInterp);
			if (prefix || before) {
				before = prefix + before;
				tok = this.tok(type, before);
				this.incrementColumn(before.length + escaped);
				this.tokens.push(this.tokEnd(tok));
			}

			// @ts-expect-error TS(2531): Object is possibly 'null'.
			let rest = matchOfStringInterp[3];
			let range;
			tok = this.tok("interpolated-code");
			this.incrementColumn(2);
			try {
				range = characterParser.parseUntil(rest, "}");
			} catch (ex) {
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				if (ex.index !== undefined) {
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					this.incrementColumn(ex.index);
				}
				// @ts-expect-error TS(2571): Object is of type 'unknown'.
				if (ex.code === "CHARACTER_PARSER:END_OF_STRING_REACHED") {
					this.error("NO_END_BRACKET", "End of line was reached with no closing bracket for interpolation.");
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
				} else if (ex.code === "CHARACTER_PARSER:MISMATCHED_BRACKET") {
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					this.error("BRACKET_MISMATCH", ex.message);
				} else {
					throw ex;
				}
			}
			// @ts-expect-error TS(2531): Object is possibly 'null'.
			tok.mustEscape = matchOfStringInterp[2] === "#";
			tok.buffer = true;
			tok.val = range.src;
			this.assertExpression(range.src);

			if (range.end + 1 < rest.length) {
				rest = rest.substr(range.end + 1);
				this.incrementColumn(range.end + 1);
				this.tokens.push(this.tokEnd(tok));
				this.addText(type, rest);
			} else {
				this.incrementColumn(rest.length);
				this.tokens.push(this.tokEnd(tok));
			}
			return;
		}

		value = prefix + value;
		tok = this.tok(type, value);
		this.incrementColumn(value.length + escaped);
		this.tokens.push(this.tokEnd(tok));
	},

	text() {
		const tok = this.scan(/^(?:\| ?| )([^\n]+)/, "text") || this.scan(/^( )/, "text") || this.scan(/^\|( ?)/, "text");
		if (tok) {
			this.addText("text", tok.val);
			return true;
		}
	},

	textHtml() {
		const tok = this.scan(/^(<[^\n]*)/, "text-html");
		if (tok) {
			this.addText("text-html", tok.val);
			return true;
		}
	},

	/**
	 * Dot.
	 */

	dot() {
		let tok;
		if ((tok = this.scanEndOfLine(/^\./, "dot"))) {
			this.tokens.push(this.tokEnd(tok));
			this.callLexerFunction("pipelessText");
			return true;
		}
	},

	/**
	 * Extends.
	 */

	extends() {
		const tok = this.scan(/^extends?(?= |$|\n)/, "extends");
		if (tok) {
			this.tokens.push(this.tokEnd(tok));
			if (!this.callLexerFunction("path")) {
				this.error("NO_EXTENDS_PATH", "missing path for extends");
			}
			return true;
		}
		if (this.scan(/^extends?\b/)) {
			this.error("MALFORMED_EXTENDS", "malformed extends");
		}
	},

	/**
	 * Block prepend.
	 */

	prepend() {
		let captures;
		if ((captures = /^(?:block +)?prepend +([^\n]+)/.exec(this.input))) {
			let name = captures[1].trim();
			let comment = "";
			if (name.includes("//")) {
				comment = `//${name.split("//").slice(1).join("//")}`;
				name = name.split("//")[0].trim();
			}
			if (!name) return;
			const tok = this.tok("block", name);
			let len = captures[0].length - comment.length;
			while (this.whitespaceRe.test(this.input.charAt(len - 1))) len--;
			this.incrementColumn(len);
			tok.mode = "prepend";
			this.tokens.push(this.tokEnd(tok));
			this.consume(captures[0].length - comment.length);
			this.incrementColumn(captures[0].length - comment.length - len);
			return true;
		}
	},

	/**
	 * Block append.
	 */

	append() {
		let captures;
		if ((captures = /^(?:block +)?append +([^\n]+)/.exec(this.input))) {
			let name = captures[1].trim();
			let comment = "";
			if (name.includes("//")) {
				comment = `//${name.split("//").slice(1).join("//")}`;
				name = name.split("//")[0].trim();
			}
			if (!name) return;
			const tok = this.tok("block", name);
			let len = captures[0].length - comment.length;
			while (this.whitespaceRe.test(this.input.charAt(len - 1))) len--;
			this.incrementColumn(len);
			tok.mode = "append";
			this.tokens.push(this.tokEnd(tok));
			this.consume(captures[0].length - comment.length);
			this.incrementColumn(captures[0].length - comment.length - len);
			return true;
		}
	},

	/**
	 * Block.
	 */

	block() {
		let captures;
		if ((captures = /^block +([^\n]+)/.exec(this.input))) {
			let name = captures[1].trim();
			let comment = "";
			if (name.includes("//")) {
				comment = `//${name.split("//").slice(1).join("//")}`;
				name = name.split("//")[0].trim();
			}
			if (!name) return;
			const tok = this.tok("block", name);
			let len = captures[0].length - comment.length;
			while (this.whitespaceRe.test(this.input.charAt(len - 1))) len--;
			this.incrementColumn(len);
			tok.mode = "replace";
			this.tokens.push(this.tokEnd(tok));
			this.consume(captures[0].length - comment.length);
			this.incrementColumn(captures[0].length - comment.length - len);
			return true;
		}
	},

	/**
	 * Mixin Block.
	 */

	mixinBlock() {
		let tok;
		if ((tok = this.scanEndOfLine(/^block/, "mixin-block"))) {
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * Yield.
	 */

	yield() {
		const tok = this.scanEndOfLine(/^yield/, "yield");
		if (tok) {
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * Include.
	 */

	include() {
		const tok = this.scan(/^include(?=:| |$|\n)/, "include");
		if (tok) {
			this.tokens.push(this.tokEnd(tok));
			while (this.callLexerFunction("filter", { inInclude: true }));
			if (!this.callLexerFunction("path")) {
				if (/^[^ \n]+/.test(this.input)) {
					// if there is more text
					this.fail();
				} else {
					// if not
					this.error("NO_INCLUDE_PATH", "missing path for include");
				}
			}
			return true;
		}
		if (this.scan(/^include\b/)) {
			this.error("MALFORMED_INCLUDE", "malformed include");
		}
	},

	/**
	 * Path
	 */

	path() {
		const tok = this.scanEndOfLine(/^ ([^\n]+)/, "path");
		if (tok && (tok.val = tok.val.trim())) {
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * Case.
	 */

	case() {
		const tok = this.scanEndOfLine(/^case +([^\n]+)/, "case");
		if (tok) {
			this.incrementColumn(-tok.val.length);
			this.assertExpression(tok.val);
			this.incrementColumn(tok.val.length);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
		if (this.scan(/^case\b/)) {
			this.error("NO_CASE_EXPRESSION", "missing expression for case");
		}
	},

	/**
	 * When.
	 */

	when() {
		const tok = this.scanEndOfLine(/^when +([^:\n]+)/, "when");
		if (tok) {
			let parser = characterParser.default(tok.val);
			while (parser.isNesting() || parser.isString()) {
				const rest = /:([^:\n]+)/.exec(this.input);
				if (!rest) break;

				tok.val += rest[0];
				this.consume(rest[0].length);
				this.incrementColumn(rest[0].length);
				parser = characterParser.default(tok.val);
			}

			this.incrementColumn(-tok.val.length);
			this.assertExpression(tok.val);
			this.incrementColumn(tok.val.length);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
		if (this.scan(/^when\b/)) {
			this.error("NO_WHEN_EXPRESSION", "missing expression for when");
		}
	},

	/**
	 * Default.
	 */

	default() {
		const tok = this.scanEndOfLine(/^default/, "default");
		if (tok) {
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
		if (this.scan(/^default\b/)) {
			this.error("DEFAULT_WITH_EXPRESSION", "default should not have an expression");
		}
	},

	/**
	 * Call mixin.
	 */

	call() {
		let tok, captures, increment;
		if ((captures = /^\+(\s*)(([-\w]+)|(#\{))/.exec(this.input))) {
			// try to consume simple or interpolated call
			if (captures[3]) {
				// simple call
				increment = captures[0].length;
				this.consume(increment);
				tok = this.tok("call", captures[3]);
			} else {
				// interpolated call
				const match = this.bracketExpression(2 + captures[1].length);
				increment = match.end + 1;
				this.consume(increment);
				this.assertExpression(match.src);
				tok = this.tok("call", `#{${match.src}}`);
			}

			this.incrementColumn(increment);

			tok.args = null;
			// Check for args (not attributes)
			if ((captures = /^ *\(/.exec(this.input))) {
				const range = this.bracketExpression(captures[0].length - 1);
				if (!/^\s*[-\w]+ *=/.test(range.src)) {
					// not attributes
					this.incrementColumn(1);
					this.consume(range.end + 1);
					tok.args = range.src;
					this.assertExpression(`[${tok.args}]`);
					for (let i = 0; i <= tok.args.length; i++) {
						if (tok.args[i] === "\n") {
							this.incrementLine(1);
						} else {
							this.incrementColumn(1);
						}
					}
				}
			}
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * Mixin.
	 */

	mixin() {
		let captures;
		if ((captures = /^mixin +([-\w]+)(?: *\((.*)\))? */.exec(this.input))) {
			this.consume(captures[0].length);
			const tok = this.tok("mixin", captures[1]);
			tok.args = captures[2] || null;
			this.incrementColumn(captures[0].length);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * Conditional.
	 */

	conditional() {
		let captures;
		if ((captures = /^(if|unless|else if|else)\b([^\n]*)/.exec(this.input))) {
			this.consume(captures[0].length);
			const type = captures[1].replace(/ /g, "-");
			const js = captures[2] && captures[2].trim();
			// type can be "if", "else-if" and "else"
			const tok = this.tok(type, js);
			this.incrementColumn(captures[0].length - js.length);

			switch (type) {
				case "if":
				case "else-if":
					this.assertExpression(js);
					break;
				case "unless":
					this.assertExpression(js);
					tok.val = `!(${js})`;
					tok.type = "if";
					break;
				case "else":
					if (js) {
						this.error("ELSE_CONDITION", "`else` cannot have a condition, perhaps you meant `else if`");
					}
					break;
			}
			this.incrementColumn(js.length);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * While.
	 */

	while() {
		let captures, tok;
		if ((captures = /^while +([^\n]+)/.exec(this.input))) {
			this.consume(captures[0].length);
			this.assertExpression(captures[1]);
			tok = this.tok("while", captures[1]);
			this.incrementColumn(captures[0].length);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
		if (this.scan(/^while\b/)) {
			this.error("NO_WHILE_EXPRESSION", "missing expression for while");
		}
	},

	/**
	 * Each.
	 */

	each() {
		let captures;
		if ((captures = /^(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? * in *([^\n]+)/.exec(this.input))) {
			this.consume(captures[0].length);
			const tok = this.tok("each", captures[1]);
			tok.key = captures[2] || null;
			this.incrementColumn(captures[0].length - captures[3].length);
			this.assertExpression(captures[3]);
			tok.code = captures[3];
			this.incrementColumn(captures[3].length);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
		const name = /^each\b/.exec(this.input) ? "each" : "for";
		if (this.scan(/^(?:each|for)\b/)) {
			this.error(
				"MALFORMED_EACH",
				`This \`${name}\` has a syntax error. \`${name}\` statements should be of the form: \`${name} VARIABLE_NAME of JS_EXPRESSION\``
			);
		}
		if (
			(captures = /^- *(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? +in +([^\n]+)/.exec(this.input))
		) {
			this.error(
				"MALFORMED_EACH",
				'Pug each and for should no longer be prefixed with a dash ("-"). They are pug keywords and not part of JavaScript.'
			);
		}
	},

	/**
	 * EachOf.
	 */

	eachOf() {
		let captures;
		if ((captures = /^(?:each|for) (.*?) of *([^\n]+)/.exec(this.input))) {
			this.consume(captures[0].length);
			const tok = this.tok("eachOf", captures[1]);
			tok.value = captures[1];
			this.incrementColumn(captures[0].length - captures[2].length);
			this.assertExpression(captures[2]);
			tok.code = captures[2];
			this.incrementColumn(captures[2].length);
			this.tokens.push(this.tokEnd(tok));

			if (
				!(
					/^[a-zA-Z_$][\w$]*$/.test(tok.value.trim()) ||
					/^\[ *[a-zA-Z_$][\w$]* *\, *[a-zA-Z_$][\w$]* *\]$/.test(tok.value.trim())
				)
			) {
				this.error(
					"MALFORMED_EACH_OF_LVAL",
					"The value variable for each must either be a valid identifier (e.g. `item`) or a pair of identifiers in square brackets (e.g. `[key, value]`)."
				);
			}

			return true;
		}
		if (
			(captures = /^- *(?:each|for) +([a-zA-Z_$][\w$]*)(?: *, *([a-zA-Z_$][\w$]*))? +of +([^\n]+)/.exec(this.input))
		) {
			this.error(
				"MALFORMED_EACH",
				'Pug each and for should not be prefixed with a dash ("-"). They are pug keywords and not part of JavaScript.'
			);
		}
	},

	/**
	 * Code.
	 */

	code() {
		let captures;
		if ((captures = /^(!?=|-)[ \t]*([^\n]+)/.exec(this.input))) {
			const flags = captures[1];
			let code = captures[2];
			let shortened = 0;
			if (this.interpolated) {
				let parsed;
				try {
					parsed = characterParser.parseUntil(code, "]");
				} catch (err) {
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					if (err.index !== undefined) {
						// @ts-expect-error TS(2571): Object is of type 'unknown'.
						this.incrementColumn(captures[0].length - code.length + err.index);
					}
					// @ts-expect-error TS(2571): Object is of type 'unknown'.
					if (err.code === "CHARACTER_PARSER:END_OF_STRING_REACHED") {
						this.error("NO_END_BRACKET", "End of line was reached with no closing bracket for interpolation.");
						// @ts-expect-error TS(2571): Object is of type 'unknown'.
					} else if (err.code === "CHARACTER_PARSER:MISMATCHED_BRACKET") {
						// @ts-expect-error TS(2571): Object is of type 'unknown'.
						this.error("BRACKET_MISMATCH", err.message);
					} else {
						throw err;
					}
				}
				shortened = code.length - parsed.end;
				code = parsed.src;
			}
			const consumed = captures[0].length - shortened;
			this.consume(consumed);
			const tok = this.tok("code", code);
			tok.mustEscape = flags.startsWith("=");
			tok.buffer = flags.startsWith("=") || flags.charAt(1) === "=";

			// p #[!=    abc] hey
			//     ^              original colno
			//     -------------- captures[0]
			//           -------- captures[2]
			//     ------         captures[0] - captures[2]
			//           ^        after colno

			// =   abc
			// ^                  original colno
			// -------            captures[0]
			//     ---            captures[2]
			// ----               captures[0] - captures[2]
			//     ^              after colno
			this.incrementColumn(captures[0].length - captures[2].length);
			if (tok.buffer) this.assertExpression(code);
			this.tokens.push(tok);

			// p #[!=    abc] hey
			//           ^        original colno
			//              ----- shortened
			//           ---      code
			//              ^     after colno

			// =   abc
			//     ^              original colno
			//                    shortened
			//     ---            code
			//        ^           after colno
			this.incrementColumn(code.length);
			this.tokEnd(tok);
			return true;
		}
	},

	/**
	 * Block code.
	 */
	blockCode() {
		let tok;
		if ((tok = this.scanEndOfLine(/^-/, "blockcode"))) {
			this.tokens.push(this.tokEnd(tok));
			this.interpolationAllowed = false;
			this.callLexerFunction("pipelessText");
			return true;
		}
	},

	/**
	 * Attribute Name.
	 */
	attribute(str: any) {
		let quote = "";
		const quoteRe = /['"]/;
		let key = "";
		let i;

		// consume all whitespace before the key
		for (i = 0; i < str.length; i++) {
			if (!this.whitespaceRe.test(str[i])) break;
			if (str[i] === "\n") {
				this.incrementLine(1);
			} else {
				this.incrementColumn(1);
			}
		}

		if (i === str.length) {
			return "";
		}

		const tok = this.tok("attribute");

		// quote?
		if (quoteRe.test(str[i])) {
			quote = str[i];
			this.incrementColumn(1);
			i++;
		}

		// start looping through the key
		for (; i < str.length; i++) {
			if (quote) {
				if (str[i] === quote) {
					this.incrementColumn(1);
					i++;
					break;
				}
			} else if (this.whitespaceRe.test(str[i]) || str[i] === "!" || str[i] === "=" || str[i] === ",") {
				break;
			}

			key += str[i];

			if (str[i] === "\n") {
				this.incrementLine(1);
			} else {
				this.incrementColumn(1);
			}
		}

		tok.name = key;

		const valueResponse = this.attributeValue(str.substr(i));

		if (valueResponse.val) {
			tok.val = valueResponse.val;
			tok.mustEscape = valueResponse.mustEscape;
		} else {
			// was a boolean attribute (ex: `input(disabled)`)
			tok.val = true;
			tok.mustEscape = true;
		}

		str = valueResponse.remainingSource;

		this.tokens.push(this.tokEnd(tok));

		for (i = 0; i < str.length; i++) {
			if (!this.whitespaceRe.test(str[i])) {
				break;
			}
			if (str[i] === "\n") {
				this.incrementLine(1);
			} else {
				this.incrementColumn(1);
			}
		}

		if (str[i] === ",") {
			this.incrementColumn(1);
			i++;
		}

		return str.substr(i);
	},

	/**
	 * Attribute Value.
	 */
	attributeValue(str: any) {
		const quoteRe = /['"]/;
		let val = "";
		let done, i, x;
		let escapeAttr = true;
		let state = characterParser.defaultState();
		let col = this.colno;
		let line = this.lineno;

		// consume all whitespace before the equals sign
		for (i = 0; i < str.length; i++) {
			if (!this.whitespaceRe.test(str[i])) break;
			if (str[i] === "\n") {
				line++;
				col = 1;
			} else {
				col++;
			}
		}

		if (i === str.length) {
			return { remainingSource: str };
		}

		if (str[i] === "!") {
			escapeAttr = false;
			col++;
			i++;
			if (str[i] !== "=") this.error("INVALID_KEY_CHARACTER", `Unexpected character ${str[i]} expected \`=\``);
		}

		if (str[i] !== "=") {
			// check for anti-pattern `div("foo"bar)`
			if (i === 0 && str && !this.whitespaceRe.test(str[0]) && str[0] !== ",") {
				this.error("INVALID_KEY_CHARACTER", `Unexpected character ${str[0]} expected \`=\``);
			} else {
				return { remainingSource: str };
			}
		}

		this.lineno = line;
		this.colno = col + 1;
		i++;

		// consume all whitespace before the value
		for (; i < str.length; i++) {
			if (!this.whitespaceRe.test(str[i])) break;
			if (str[i] === "\n") {
				this.incrementLine(1);
			} else {
				this.incrementColumn(1);
			}
		}

		line = this.lineno;
		col = this.colno;

		// start looping through the value
		for (; i < str.length; i++) {
			// if the character is in a string or in parentheses/brackets/braces
			if (!(state.isNesting() || state.isString())) {
				if (this.whitespaceRe.test(str[i])) {
					done = false;

					// find the first non-whitespace character
					for (x = i; x < str.length; x++) {
						if (!this.whitespaceRe.test(str[x])) {
							// if it is a JavaScript punctuator, then assume that it is
							// a part of the value
							const isNotPunctuator = !characterParser.isPunctuator(str[x]);
							const isQuote = quoteRe.test(str[x]);
							const isColon = str[x] === ":";
							const isSpreadOperator = str[x] + str[x + 1] + str[x + 2] === "...";
							if ((isNotPunctuator || isQuote || isColon || isSpreadOperator) && this.assertExpression(val, true)) {
								done = true;
							}
							break;
						}
					}

					// if everything else is whitespace, return now so last attribute
					// does not include trailing whitespace
					if (done || x === str.length) {
						break;
					}
				}

				// if there's no whitespace and the character is not ',', the
				// attribute did not end.
				if (str[i] === "," && this.assertExpression(val, true)) {
					break;
				}
			}

			state = characterParser.parseChar(str[i], state);
			val += str[i];

			if (str[i] === "\n") {
				line++;
				col = 1;
			} else {
				col++;
			}
		}

		this.assertExpression(val);

		this.lineno = line;
		this.colno = col;

		return { val, mustEscape: escapeAttr, remainingSource: str.substr(i) };
	},

	/**
	 * Attributes.
	 */

	attrs() {
		let tok;

		if ("(" == this.input.charAt(0)) {
			tok = this.tok("start-attributes");
			const index = this.bracketExpression().end;
			let str = this.input.substr(1, index - 1);

			this.incrementColumn(1);
			this.tokens.push(this.tokEnd(tok));
			this.assertNestingCorrect(str);
			this.consume(index + 1);

			while (str) {
				str = this.attribute(str);
			}

			tok = this.tok("end-attributes");
			this.incrementColumn(1);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * &attributes block
	 */
	attributesBlock() {
		if (/^&attributes\b/.test(this.input)) {
			let consumed = 11;
			this.consume(consumed);
			const tok = this.tok("&attributes");
			this.incrementColumn(consumed);
			const args = this.bracketExpression();
			consumed = args.end + 1;
			this.consume(consumed);
			tok.val = args.src;
			this.incrementColumn(consumed);
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * Indent | Outdent | Newline.
	 */

	indent() {
		const captures = this.scanIndentation();
		let tok;

		if (captures) {
			const indents = captures[1].length;

			this.incrementLine(1);
			this.consume(indents + 1);

			if (" " == this.input[0] || "\t" == this.input[0]) {
				this.error("INVALID_INDENTATION", "Invalid indentation, you can use tabs or spaces but not both");
			}

			// blank line
			if ("\n" == this.input[0]) {
				this.interpolationAllowed = true;
				return this.tokEnd(this.tok("newline"));
			}

			// outdent
			if (indents < this.indentStack[0]) {
				let outdent_count = 0;
				while (this.indentStack[0] > indents) {
					if (this.indentStack[1] < indents) {
						this.error(
							"INCONSISTENT_INDENTATION",
							`Inconsistent indentation. Expecting either ${this.indentStack[1]} or ${this.indentStack[0]} spaces/tabs.`
						);
					}
					outdent_count++;
					this.indentStack.shift();
				}
				while (outdent_count--) {
					this.colno = 1;
					tok = this.tok("outdent");
					this.colno = this.indentStack[0] + 1;
					this.tokens.push(this.tokEnd(tok));
				}
				// indent
			} else if (indents && indents != this.indentStack[0]) {
				tok = this.tok("indent", indents);
				this.colno = 1 + indents;
				this.tokens.push(this.tokEnd(tok));
				this.indentStack.unshift(indents);
				// newline
			} else {
				tok = this.tok("newline");
				this.colno = 1 + Math.min(this.indentStack[0] || 0, indents);
				this.tokens.push(this.tokEnd(tok));
			}

			this.interpolationAllowed = true;
			return true;
		}
	},

	// @ts-expect-error TS(7023): 'pipelessText' implicitly has return type 'any' be... Remove this comment to see the full error message
	pipelessText: function pipelessText(indents: any) {
		while (this.callLexerFunction("blank"));

		const captures = this.scanIndentation();

		indents = indents || (captures && captures[1].length);
		if (indents > this.indentStack[0]) {
			this.tokens.push(this.tokEnd(this.tok("start-pipeless-text")));
			const tokens = [];
			const token_indent: any = [];
			let isMatch;
			// Index in this.input. Can't use this.consume because we might need to
			// retry lexing the block.
			let stringPtr = 0;
			do {
				// text has `\n` as a prefix
				let i = this.input.substr(stringPtr + 1).indexOf("\n");
				if (-1 == i) i = this.input.length - stringPtr - 1;
				const str = this.input.substr(stringPtr + 1, i);
				const lineCaptures = this.indentRe.exec(`\n${str}`);
				const lineIndents = lineCaptures && lineCaptures[1].length;
				isMatch = lineIndents >= indents;
				token_indent.push(isMatch);
				isMatch = isMatch || !str.trim();
				if (isMatch) {
					// consume test along with `\n` prefix if match
					stringPtr += str.length + 1;
					tokens.push(str.substr(indents));
				} else if (lineIndents > this.indentStack[0]) {
					// line is indented less than the first line but is still indented
					// need to retry lexing the text block
					this.tokens.pop();
					return pipelessText.call(this, lineCaptures[1].length);
				}
			} while (this.input.length - stringPtr && isMatch);
			this.consume(stringPtr);
			while (this.input.length === 0 && tokens[tokens.length - 1] === "") tokens.pop();
			// @ts-expect-error TS(2730): An arrow function cannot have a 'this' parameter.
			tokens.forEach((this: any, token: any, i: any) => {
				let tok;
				this.incrementLine(1);
				if (i !== 0) tok = this.tok("newline");
				if (token_indent[i]) this.incrementColumn(indents);
				if (tok) this.tokens.push(this.tokEnd(tok));
				this.addText("text", token);
			});
			this.tokens.push(this.tokEnd(this.tok("end-pipeless-text")));
			return true;
		}
	},

	/**
	 * Slash.
	 */

	slash() {
		const tok = this.scan(/^\//, "slash");
		if (tok) {
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	/**
	 * ':'
	 */

	colon() {
		const tok = this.scan(/^: +/, ":");
		if (tok) {
			this.tokens.push(this.tokEnd(tok));
			return true;
		}
	},

	fail() {
		this.error("UNEXPECTED_TEXT", `unexpected text "${this.input.substr(0, 5)}"`);
	},

	callLexerFunction(func: any) {
		const rest = [];
		for (var i = 1; i < arguments.length; i++) {
			rest.push(arguments[i]);
		}
		const pluginArgs = [this].concat(rest);
		for (var i = 0; i < this.plugins.length; i++) {
			const plugin = this.plugins[i];
			if (plugin[func] && plugin[func].apply(plugin, pluginArgs)) {
				return true;
			}
		}
		return this[func].apply(this, rest);
	},

	/**
	 * Move to the next token
	 *
	 * @api private
	 */

	advance() {
		return (
			this.callLexerFunction("blank") ||
			this.callLexerFunction("eos") ||
			this.callLexerFunction("endInterpolation") ||
			this.callLexerFunction("yield") ||
			this.callLexerFunction("doctype") ||
			this.callLexerFunction("interpolation") ||
			this.callLexerFunction("case") ||
			this.callLexerFunction("when") ||
			this.callLexerFunction("default") ||
			this.callLexerFunction("extends") ||
			this.callLexerFunction("append") ||
			this.callLexerFunction("prepend") ||
			this.callLexerFunction("block") ||
			this.callLexerFunction("mixinBlock") ||
			this.callLexerFunction("include") ||
			this.callLexerFunction("mixin") ||
			this.callLexerFunction("call") ||
			this.callLexerFunction("conditional") ||
			this.callLexerFunction("eachOf") ||
			this.callLexerFunction("each") ||
			this.callLexerFunction("while") ||
			this.callLexerFunction("tag") ||
			this.callLexerFunction("filter") ||
			this.callLexerFunction("blockCode") ||
			this.callLexerFunction("code") ||
			this.callLexerFunction("id") ||
			this.callLexerFunction("dot") ||
			this.callLexerFunction("className") ||
			this.callLexerFunction("attrs") ||
			this.callLexerFunction("attributesBlock") ||
			this.callLexerFunction("indent") ||
			this.callLexerFunction("text") ||
			this.callLexerFunction("textHtml") ||
			this.callLexerFunction("comment") ||
			this.callLexerFunction("slash") ||
			this.callLexerFunction("colon") ||
			this.fail()
		);
	},

	/**
	 * Return an array of tokens for the current file
	 *
	 * @returns {Array.<Token>}
	 * @api public
	 */
	getTokens() {
		while (!this.ended) {
			this.callLexerFunction("advance");
		}
		return this.tokens;
	},
};
