// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'assert'.
const assert = require("assert");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const TokenStream = require("token-stream");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'error'.
const error = require("pug-error");
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const inlineTags = require("./lib/inline-tags");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = parse;
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.Parser = Parser;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'parse'.
function parse(tokens: any, options: any) {
	// @ts-expect-error TS(7009): 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
	const parser = new Parser(tokens, options);
	const ast = parser.parse();
	return JSON.parse(JSON.stringify(ast));
}

/**
 * Initialize `Parser` with the given input `str` and `filename`.
 *
 * @param {String} str
 * @param {String} filename
 * @param {Object} options
 * @api public
 */

function Parser(this: any, tokens: any, options: any) {
	options = options || {};
	if (!Array.isArray(tokens)) {
		throw new Error(`Expected tokens to be an Array but got "${typeof tokens}"`);
	}
	if (typeof options !== "object") {
		throw new Error(`Expected "options" to be an object but got "${typeof options}"`);
	}
	this.tokens = new TokenStream(tokens);
	this.filename = options.filename;
	this.src = options.src;
	this.inMixin = 0;
	this.plugins = options.plugins || [];
}

/**
 * Parser prototype.
 */

Parser.prototype = {
	/**
	 * Save original constructor
	 */

	constructor: Parser,

	error(code: any, message: any, token: any) {
		const err = error(code, message, {
			line: token.loc.start.line,
			column: token.loc.start.column,
			filename: this.filename,
			src: this.src,
		});
		throw err;
	},

	/**
	 * Return the next token object.
	 *
	 * @return {Object}
	 * @api private
	 */

	advance() {
		return this.tokens.advance();
	},

	/**
	 * Single token lookahead.
	 *
	 * @return {Object}
	 * @api private
	 */

	peek() {
		return this.tokens.peek();
	},

	/**
	 * `n` token lookahead.
	 *
	 * @param {Number} n
	 * @return {Object}
	 * @api private
	 */

	lookahead(n: any) {
		return this.tokens.lookahead(n);
	},

	/**
	 * Parse input returning a string of js for evaluation.
	 *
	 * @return {String}
	 * @api public
	 */

	parse() {
		const block = this.emptyBlock(0);

		while ("eos" != this.peek().type) {
			if ("newline" == this.peek().type) {
				this.advance();
			} else if ("text-html" == this.peek().type) {
				block.nodes = block.nodes.concat(this.parseTextHtml());
			} else {
				const expr = this.parseExpr();
				if (expr) {
					if (expr.type === "Block") {
						block.nodes = block.nodes.concat(expr.nodes);
					} else {
						block.nodes.push(expr);
					}
				}
			}
		}

		return block;
	},

	/**
	 * Expect the given type, or throw an exception.
	 *
	 * @param {String} type
	 * @api private
	 */

	expect(type: any) {
		if (this.peek().type === type) {
			return this.advance();
		}
		this.error("INVALID_TOKEN", `expected "${type}", but got "${this.peek().type}"`, this.peek());
	},

	/**
	 * Accept the given `type`.
	 *
	 * @param {String} type
	 * @api private
	 */

	accept(type: any) {
		if (this.peek().type === type) {
			return this.advance();
		}
	},

	initBlock(line: any, nodes: any) {
		/* istanbul ignore if */
		if ((line | 0) !== line) throw new Error("`line` is not an integer");
		/* istanbul ignore if */
		if (!Array.isArray(nodes)) throw new Error("`nodes` is not an array");
		return {
			type: "Block",
			nodes,
			line,
			filename: this.filename,
		};
	},

	emptyBlock(line: any) {
		return this.initBlock(line, []);
	},

	runPlugin(context: any, tok: any) {
		const rest = [this];
		for (var i = 2; i < arguments.length; i++) {
			rest.push(arguments[i]);
		}
		let pluginContext;
		for (var i = 0; i < this.plugins.length; i++) {
			const plugin = this.plugins[i];
			if (plugin[context] && plugin[context][tok.type]) {
				if (pluginContext)
					throw new Error(
						`Multiple plugin handlers found for context ${JSON.stringify(context)}, token type ${JSON.stringify(
							tok.type
						)}`
					);
				pluginContext = plugin[context];
			}
		}
		if (pluginContext) return pluginContext[tok.type].apply(pluginContext, rest);
	},

	/**
	 *   tag
	 * | doctype
	 * | mixin
	 * | include
	 * | filter
	 * | comment
	 * | text
	 * | text-html
	 * | dot
	 * | each
	 * | code
	 * | yield
	 * | id
	 * | class
	 * | interpolation
	 */

	parseExpr() {
		switch (this.peek().type) {
			case "tag":
				return this.parseTag();
			case "mixin":
				return this.parseMixin();
			case "block":
				return this.parseBlock();
			case "mixin-block":
				return this.parseMixinBlock();
			case "case":
				return this.parseCase();
			case "extends":
				return this.parseExtends();
			case "include":
				return this.parseInclude();
			case "doctype":
				return this.parseDoctype();
			case "filter":
				return this.parseFilter();
			case "comment":
				return this.parseComment();
			case "text":
			case "interpolated-code":
			case "start-pug-interpolation":
				return this.parseText({ block: true });
			case "text-html":
				return this.initBlock(this.peek().loc.start.line, this.parseTextHtml());
			case "dot":
				return this.parseDot();
			case "each":
				return this.parseEach();
			case "eachOf":
				return this.parseEachOf();
			case "code":
				return this.parseCode();
			case "blockcode":
				return this.parseBlockCode();
			case "if":
				return this.parseConditional();
			case "while":
				return this.parseWhile();
			case "call":
				return this.parseCall();
			case "interpolation":
				return this.parseInterpolation();
			case "yield":
				return this.parseYield();
			case "id":
			case "class":
				if (!this.peek().loc.start) debugger;
				this.tokens.defer({
					type: "tag",
					val: "div",
					loc: this.peek().loc,
					filename: this.filename,
				});
				return this.parseExpr();
			default:
				var pluginResult = this.runPlugin("expressionTokens", this.peek());
				if (pluginResult) return pluginResult;
				this.error("INVALID_TOKEN", `unexpected token "${this.peek().type}"`, this.peek());
		}
	},

	parseDot() {
		this.advance();
		return this.parseTextBlock();
	},

	/**
	 * Text
	 */

	parseText(options: any) {
		const tags = [];
		const lineno = this.peek().loc.start.line;
		let nextTok = this.peek();
		loop: while (true) {
			switch (nextTok.type) {
				case "text":
					var tok = this.advance();
					tags.push({
						type: "Text",
						val: tok.val,
						line: tok.loc.start.line,
						column: tok.loc.start.column,
						filename: this.filename,
					});
					break;
				case "interpolated-code":
					var tok = this.advance();
					tags.push({
						type: "Code",
						val: tok.val,
						buffer: tok.buffer,
						mustEscape: tok.mustEscape !== false,
						isInline: true,
						line: tok.loc.start.line,
						column: tok.loc.start.column,
						filename: this.filename,
					});
					break;
				case "newline":
					if (!options || !options.block) break loop;
					var tok = this.advance();
					var nextType = this.peek().type;
					if (nextType === "text" || nextType === "interpolated-code") {
						tags.push({
							type: "Text",
							val: "\n",
							line: tok.loc.start.line,
							column: tok.loc.start.column,
							filename: this.filename,
						});
					}
					break;
				case "start-pug-interpolation":
					this.advance();
					tags.push(this.parseExpr());
					this.expect("end-pug-interpolation");
					break;
				default:
					var pluginResult = this.runPlugin("textTokens", nextTok, tags);
					if (pluginResult) break;
					break loop;
			}
			nextTok = this.peek();
		}
		if (tags.length === 1) return tags[0];
		return this.initBlock(lineno, tags);
	},

	parseTextHtml() {
		const nodes = [];
		let currentNode: any = null;
		loop: while (true) {
			switch (this.peek().type) {
				case "text-html":
					var text = this.advance();
					if (!currentNode) {
						currentNode = {
							type: "Text",
							val: text.val,
							filename: this.filename,
							line: text.loc.start.line,
							column: text.loc.start.column,
							isHtml: true,
						};
						nodes.push(currentNode);
					} else {
						currentNode.val += `\n${text.val}`;
					}
					break;
				case "indent":
					var block = this.block();
					block.nodes.forEach((node: any) => {
						if (node.isHtml) {
							if (!currentNode) {
								currentNode = node;
								nodes.push(currentNode);
							} else {
								currentNode.val += `\n${node.val}`;
							}
						} else {
							currentNode = null;
							nodes.push(node);
						}
					});
					break;
				case "code":
					currentNode = null;
					nodes.push(this.parseCode(true));
					break;
				case "newline":
					this.advance();
					break;
				default:
					break loop;
			}
		}
		return nodes;
	},

	/**
	 *   ':' expr
	 * | block
	 */

	parseBlockExpansion() {
		const tok = this.accept(":");
		if (tok) {
			const expr = this.parseExpr();
			return expr.type === "Block" ? expr : this.initBlock(tok.loc.start.line, [expr]);
		}
		return this.block();
	},

	/**
	 * case
	 */

	parseCase() {
		const tok = this.expect("case");
		const node = {
			type: "Case",
			expr: tok.val,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};

		const block = this.emptyBlock(tok.loc.start.line + 1);
		this.expect("indent");
		while ("outdent" != this.peek().type) {
			switch (this.peek().type) {
				case "comment":
				case "newline":
					this.advance();
					break;
				case "when":
					block.nodes.push(this.parseWhen());
					break;
				case "default":
					block.nodes.push(this.parseDefault());
					break;
				default:
					var pluginResult = this.runPlugin("caseTokens", this.peek(), block);
					if (pluginResult) break;
					this.error(
						"INVALID_TOKEN",
						`Unexpected token "${this.peek().type}", expected "when", "default" or "newline"`,
						this.peek()
					);
			}
		}
		this.expect("outdent");

		// @ts-expect-error TS(2339): Property 'block' does not exist on type '{ type: s... Remove this comment to see the full error message
		node.block = block;

		return node;
	},

	/**
	 * when
	 */

	parseWhen() {
		const tok = this.expect("when");
		if (this.peek().type !== "newline") {
			return {
				type: "When",
				expr: tok.val,
				block: this.parseBlockExpansion(),
				debug: false,
				line: tok.loc.start.line,
				column: tok.loc.start.column,
				filename: this.filename,
			};
		}
		return {
			type: "When",
			expr: tok.val,
			debug: false,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	/**
	 * default
	 */

	parseDefault() {
		const tok = this.expect("default");
		return {
			type: "When",
			expr: "default",
			block: this.parseBlockExpansion(),
			debug: false,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	/**
	 * code
	 */

	parseCode(noBlock: any) {
		const tok = this.expect("code");
		assert(typeof tok.mustEscape === "boolean", "Please update to the newest version of pug-lexer.");
		const node = {
			type: "Code",
			val: tok.val,
			buffer: tok.buffer,
			mustEscape: tok.mustEscape !== false,
			isInline: !!noBlock,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
		// todo: why is this here?  It seems like a hacky workaround
		// @ts-expect-error TS(2339): Property 'debug' does not exist on type '{ type: s... Remove this comment to see the full error message
		if (node.val.match(/^ *else/)) node.debug = false;

		if (noBlock) return node;

		let block;

		// handle block
		block = "indent" == this.peek().type;
		if (block) {
			if (tok.buffer) {
				this.error("BLOCK_IN_BUFFERED_CODE", "Buffered code cannot have a block attached to it", this.peek());
			}
			// @ts-expect-error TS(2339): Property 'block' does not exist on type '{ type: s... Remove this comment to see the full error message
			node.block = this.block();
		}

		return node;
	},
	parseConditional() {
		let tok = this.expect("if");
		const node = {
			type: "Conditional",
			test: tok.val,
			consequent: this.emptyBlock(tok.loc.start.line),
			alternate: null,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};

		// handle block
		if ("indent" == this.peek().type) {
			node.consequent = this.block();
		}

		let currentNode = node;
		while (true) {
			if (this.peek().type === "newline") {
				this.expect("newline");
			} else if (this.peek().type === "else-if") {
				tok = this.expect("else-if");
				// @ts-expect-error TS(2322): Type '{ type: string; test: any; consequent: any; ... Remove this comment to see the full error message
				currentNode = currentNode.alternate = {
					type: "Conditional",
					test: tok.val,
					consequent: this.emptyBlock(tok.loc.start.line),
					alternate: null,
					line: tok.loc.start.line,
					column: tok.loc.start.column,
					filename: this.filename,
				};
				if ("indent" == this.peek().type) {
					currentNode.consequent = this.block();
				}
			} else if (this.peek().type === "else") {
				this.expect("else");
				if (this.peek().type === "indent") {
					currentNode.alternate = this.block();
				}
				break;
			} else {
				break;
			}
		}

		return node;
	},
	parseWhile() {
		const tok = this.expect("while");
		const node = {
			type: "While",
			test: tok.val,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};

		// handle block
		if ("indent" == this.peek().type) {
			// @ts-expect-error TS(2339): Property 'block' does not exist on type '{ type: s... Remove this comment to see the full error message
			node.block = this.block();
		} else {
			// @ts-expect-error TS(2339): Property 'block' does not exist on type '{ type: s... Remove this comment to see the full error message
			node.block = this.emptyBlock(tok.loc.start.line);
		}

		return node;
	},

	/**
	 * block code
	 */

	parseBlockCode() {
		let tok = this.expect("blockcode");
		const line = tok.loc.start.line;
		const column = tok.loc.start.column;
		const body = this.peek();
		let text = "";
		if (body.type === "start-pipeless-text") {
			this.advance();
			while (this.peek().type !== "end-pipeless-text") {
				tok = this.advance();
				switch (tok.type) {
					case "text":
						text += tok.val;
						break;
					case "newline":
						text += "\n";
						break;
					default:
						var pluginResult = this.runPlugin("blockCodeTokens", tok, tok);
						if (pluginResult) {
							text += pluginResult;
							break;
						}
						this.error("INVALID_TOKEN", `Unexpected token type: ${tok.type}`, tok);
				}
			}
			this.advance();
		}
		return {
			type: "Code",
			val: text,
			buffer: false,
			mustEscape: false,
			isInline: false,
			line,
			column,
			filename: this.filename,
		};
	},
	/**
	 * comment
	 */

	parseComment() {
		const tok = this.expect("comment");
		let block;
		if ((block = this.parseTextBlock())) {
			return {
				type: "BlockComment",
				val: tok.val,
				block,
				buffer: tok.buffer,
				line: tok.loc.start.line,
				column: tok.loc.start.column,
				filename: this.filename,
			};
		}
		return {
			type: "Comment",
			val: tok.val,
			buffer: tok.buffer,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	/**
	 * doctype
	 */

	parseDoctype() {
		const tok = this.expect("doctype");
		return {
			type: "Doctype",
			val: tok.val,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	parseIncludeFilter() {
		const tok = this.expect("filter");
		let attrs = [];

		if (this.peek().type === "start-attributes") {
			attrs = this.attrs();
		}

		return {
			type: "IncludeFilter",
			name: tok.val,
			attrs,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	/**
	 * filter attrs? text-block
	 */

	parseFilter() {
		const tok = this.expect("filter");
		let block,
			attrs = [];

		if (this.peek().type === "start-attributes") {
			attrs = this.attrs();
		}

		if (this.peek().type === "text") {
			const textToken = this.advance();
			block = this.initBlock(textToken.loc.start.line, [
				{
					type: "Text",
					val: textToken.val,
					line: textToken.loc.start.line,
					column: textToken.loc.start.column,
					filename: this.filename,
				},
			]);
		} else if (this.peek().type === "filter") {
			block = this.initBlock(tok.loc.start.line, [this.parseFilter()]);
		} else {
			block = this.parseTextBlock() || this.emptyBlock(tok.loc.start.line);
		}

		return {
			type: "Filter",
			name: tok.val,
			block,
			attrs,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	/**
	 * each block
	 */

	parseEach() {
		const tok = this.expect("each");
		const node = {
			type: "Each",
			obj: tok.code,
			val: tok.val,
			key: tok.key,
			block: this.block(),
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
		if (this.peek().type == "else") {
			this.advance();
			// @ts-expect-error TS(2339): Property 'alternate' does not exist on type '{ typ... Remove this comment to see the full error message
			node.alternate = this.block();
		}
		return node;
	},

	parseEachOf() {
		const tok = this.expect("eachOf");
		const node = {
			type: "EachOf",
			obj: tok.code,
			val: tok.val,
			block: this.block(),
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
		return node;
	},
	/**
	 * 'extends' name
	 */

	parseExtends() {
		const tok = this.expect("extends");
		const path = this.expect("path");
		return {
			type: "Extends",
			file: {
				type: "FileReference",
				path: path.val.trim(),
				line: path.loc.start.line,
				column: path.loc.start.column,
				filename: this.filename,
			},
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	/**
	 * 'block' name block
	 */

	parseBlock() {
		const tok = this.expect("block");

		const node = "indent" == this.peek().type ? this.block() : this.emptyBlock(tok.loc.start.line);
		node.type = "NamedBlock";
		node.name = tok.val.trim();
		node.mode = tok.mode;
		node.line = tok.loc.start.line;
		node.column = tok.loc.start.column;

		return node;
	},

	parseMixinBlock() {
		const tok = this.expect("mixin-block");
		if (!this.inMixin) {
			this.error("BLOCK_OUTISDE_MIXIN", "Anonymous blocks are not allowed unless they are part of a mixin.", tok);
		}
		return {
			type: "MixinBlock",
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	parseYield() {
		const tok = this.expect("yield");
		return {
			type: "YieldBlock",
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
	},

	/**
	 * include block?
	 */

	parseInclude() {
		const tok = this.expect("include");
		const node = {
			type: "Include",
			file: {
				type: "FileReference",
				filename: this.filename,
			},
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};
		const filters = [];
		while (this.peek().type === "filter") {
			filters.push(this.parseIncludeFilter());
		}
		const path = this.expect("path");

		// @ts-expect-error TS(2339): Property 'path' does not exist on type '{ type: st... Remove this comment to see the full error message
		node.file.path = path.val.trim();
		// @ts-expect-error TS(2339): Property 'line' does not exist on type '{ type: st... Remove this comment to see the full error message
		node.file.line = path.loc.start.line;
		// @ts-expect-error TS(2339): Property 'column' does not exist on type '{ type: ... Remove this comment to see the full error message
		node.file.column = path.loc.start.column;

		// @ts-expect-error TS(2339): Property 'path' does not exist on type '{ type: st... Remove this comment to see the full error message
		if ((node.file.path.endsWith(".jade") || node.file.path.endsWith(".pug")) && !filters.length) {
			// @ts-expect-error TS(2339): Property 'block' does not exist on type '{ type: s... Remove this comment to see the full error message
			node.block = "indent" == this.peek().type ? this.block() : this.emptyBlock(tok.loc.start.line);
			// @ts-expect-error TS(2339): Property 'path' does not exist on type '{ type: st... Remove this comment to see the full error message
			if (node.file.path.endsWith(".jade")) {
				console.warn(
					// @ts-expect-error TS(2339): Property 'path' does not exist on type '{ type: st... Remove this comment to see the full error message
					`${this.filename}, line ${tok.loc.start.line}:\nThe .jade extension is deprecated, use .pug for "${node.file.path}".`
				);
			}
		} else {
			node.type = "RawInclude";
			// @ts-expect-error TS(2339): Property 'filters' does not exist on type '{ type:... Remove this comment to see the full error message
			node.filters = filters;
			if (this.peek().type === "indent") {
				this.error("RAW_INCLUDE_BLOCK", "Raw inclusion cannot contain a block", this.peek());
			}
		}
		return node;
	},

	/**
	 * call ident block
	 */

	parseCall() {
		const tok = this.expect("call");
		const name = tok.val;
		const args = tok.args;
		const mixin = {
			type: "Mixin",
			name,
			args,
			block: this.emptyBlock(tok.loc.start.line),
			call: true,
			attrs: [],
			attributeBlocks: [],
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};

		this.tag(mixin);
		// @ts-expect-error TS(2339): Property 'code' does not exist on type '{ type: st... Remove this comment to see the full error message
		if (mixin.code) {
			// @ts-expect-error TS(2339): Property 'code' does not exist on type '{ type: st... Remove this comment to see the full error message
			mixin.block.nodes.push(mixin.code);
			// @ts-expect-error TS(2339): Property 'code' does not exist on type '{ type: st... Remove this comment to see the full error message
			delete mixin.code;
		}
		if (mixin.block.nodes.length === 0) mixin.block = null;
		return mixin;
	},

	/**
	 * mixin block
	 */

	parseMixin() {
		const tok = this.expect("mixin");
		const name = tok.val;
		const args = tok.args;

		if ("indent" == this.peek().type) {
			this.inMixin++;
			const mixin = {
				type: "Mixin",
				name,
				args,
				block: this.block(),
				call: false,
				line: tok.loc.start.line,
				column: tok.loc.start.column,
				filename: this.filename,
			};
			this.inMixin--;
			return mixin;
		}
		this.error("MIXIN_WITHOUT_BODY", `Mixin ${name} declared without body`, tok);
	},

	/**
	 * indent (text | newline)* outdent
	 */

	parseTextBlock() {
		var tok = this.accept("start-pipeless-text");
		if (!tok) return;
		const block = this.emptyBlock(tok.loc.start.line);
		while (this.peek().type !== "end-pipeless-text") {
			var tok = this.advance();
			switch (tok.type) {
				case "text":
					block.nodes.push({
						type: "Text",
						val: tok.val,
						line: tok.loc.start.line,
						column: tok.loc.start.column,
						filename: this.filename,
					});
					break;
				case "newline":
					block.nodes.push({
						type: "Text",
						val: "\n",
						line: tok.loc.start.line,
						column: tok.loc.start.column,
						filename: this.filename,
					});
					break;
				case "start-pug-interpolation":
					block.nodes.push(this.parseExpr());
					this.expect("end-pug-interpolation");
					break;
				case "interpolated-code":
					block.nodes.push({
						type: "Code",
						val: tok.val,
						buffer: tok.buffer,
						mustEscape: tok.mustEscape !== false,
						isInline: true,
						line: tok.loc.start.line,
						column: tok.loc.start.column,
						filename: this.filename,
					});
					break;
				default:
					var pluginResult = this.runPlugin("textBlockTokens", tok, block, tok);
					if (pluginResult) break;
					this.error("INVALID_TOKEN", `Unexpected token type: ${tok.type}`, tok);
			}
		}
		this.advance();
		return block;
	},

	/**
	 * indent expr* outdent
	 */

	block() {
		const tok = this.expect("indent");
		const block = this.emptyBlock(tok.loc.start.line);
		while ("outdent" != this.peek().type) {
			if ("newline" == this.peek().type) {
				this.advance();
			} else if ("text-html" == this.peek().type) {
				block.nodes = block.nodes.concat(this.parseTextHtml());
			} else {
				const expr = this.parseExpr();
				if (expr.type === "Block") {
					block.nodes = block.nodes.concat(expr.nodes);
				} else {
					block.nodes.push(expr);
				}
			}
		}
		this.expect("outdent");
		return block;
	},

	/**
	 * interpolation (attrs | class | id)* (text | code | ':')? newline* block?
	 */

	parseInterpolation() {
		const tok = this.advance();
		const tag = {
			type: "InterpolatedTag",
			expr: tok.val,
			selfClosing: false,
			block: this.emptyBlock(tok.loc.start.line),
			attrs: [],
			attributeBlocks: [],
			isInline: false,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};

		return this.tag(tag, { selfClosingAllowed: true });
	},

	/**
	 * tag (attrs | class | id)* (text | code | ':')? newline* block?
	 */

	parseTag() {
		const tok = this.advance();
		const tag = {
			type: "Tag",
			name: tok.val,
			selfClosing: false,
			block: this.emptyBlock(tok.loc.start.line),
			attrs: [],
			attributeBlocks: [],
			isInline: inlineTags.indexOf(tok.val) !== -1,
			line: tok.loc.start.line,
			column: tok.loc.start.column,
			filename: this.filename,
		};

		return this.tag(tag, { selfClosingAllowed: true });
	},

	/**
	 * Parse tag.
	 */

	tag(tag: any, options: any) {
		let seenAttrs = false;
		// @ts-expect-error TS(7034): Variable 'attributeNames' implicitly has type 'any... Remove this comment to see the full error message
		const attributeNames = [];
		const selfClosingAllowed = options && options.selfClosingAllowed;
		// (attrs | class | id)*
		out: while (true) {
			switch (this.peek().type) {
				case "id":
				case "class":
					var tok = this.advance();
					if (tok.type === "id") {
						// @ts-expect-error TS(7005): Variable 'attributeNames' implicitly has an 'any[]... Remove this comment to see the full error message
						if (attributeNames.includes("id")) {
							this.error("DUPLICATE_ID", 'Duplicate attribute "id" is not allowed.', tok);
						}
						attributeNames.push("id");
					}
					tag.attrs.push({
						name: tok.type,
						val: `'${tok.val}'`,
						line: tok.loc.start.line,
						column: tok.loc.start.column,
						filename: this.filename,
						mustEscape: false,
					});
					continue;
				case "start-attributes":
					if (seenAttrs) {
						console.warn(
							`${this.filename}, line ${
								this.peek().loc.start.line
							}:\nYou should not have pug tags with multiple attributes.`
						);
					}
					seenAttrs = true;
					tag.attrs = tag.attrs.concat(this.attrs(attributeNames));
					continue;
				case "&attributes":
					var tok = this.advance();
					tag.attributeBlocks.push({
						type: "AttributeBlock",
						val: tok.val,
						line: tok.loc.start.line,
						column: tok.loc.start.column,
						filename: this.filename,
					});
					break;
				default:
					var pluginResult = this.runPlugin("tagAttributeTokens", this.peek(), tag, attributeNames);
					if (pluginResult) break;
					break out;
			}
		}

		// check immediate '.'
		if ("dot" == this.peek().type) {
			tag.textOnly = true;
			this.advance();
		}

		// (text | code | ':')?
		switch (this.peek().type) {
			case "text":
			case "interpolated-code":
				var text = this.parseText();
				if (text.type === "Block") {
					tag.block.nodes.push.apply(tag.block.nodes, text.nodes);
				} else {
					tag.block.nodes.push(text);
				}
				break;
			case "code":
				tag.block.nodes.push(this.parseCode(true));
				break;
			case ":":
				this.advance();
				var expr = this.parseExpr();
				tag.block = expr.type === "Block" ? expr : this.initBlock(tag.line, [expr]);
				break;
			case "newline":
			case "indent":
			case "outdent":
			case "eos":
			case "start-pipeless-text":
			case "end-pug-interpolation":
				break;
			// @ts-expect-error TS(7029): Fallthrough case in switch.
			case "slash":
				if (selfClosingAllowed) {
					this.advance();
					tag.selfClosing = true;
					break;
				}
			default:
				var pluginResult = this.runPlugin("tagTokens", this.peek(), tag, options);
				if (pluginResult) break;
				this.error(
					"INVALID_TOKEN",
					`Unexpected token \`${this.peek().type}\` expected \`text\`, \`interpolated-code\`, \`code\`, \`:\`${
						selfClosingAllowed ? ", `slash`" : ""
					}, \`newline\` or \`eos\``,
					this.peek()
				);
		}

		// newline*
		while ("newline" == this.peek().type) this.advance();

		// block?
		if (tag.textOnly) {
			tag.block = this.parseTextBlock() || this.emptyBlock(tag.line);
		} else if ("indent" == this.peek().type) {
			const block = this.block();
			for (let i = 0, len = block.nodes.length; i < len; ++i) {
				tag.block.nodes.push(block.nodes[i]);
			}
		}

		return tag;
	},

	attrs(attributeNames: any) {
		this.expect("start-attributes");

		const attrs = [];
		let tok = this.advance();
		while (tok.type === "attribute") {
			if (tok.name !== "class" && attributeNames) {
				if (attributeNames.indexOf(tok.name) !== -1) {
					this.error("DUPLICATE_ATTRIBUTE", `Duplicate attribute "${tok.name}" is not allowed.`, tok);
				}
				attributeNames.push(tok.name);
			}
			attrs.push({
				name: tok.name,
				val: tok.val,
				line: tok.loc.start.line,
				column: tok.loc.start.column,
				filename: this.filename,
				mustEscape: tok.mustEscape !== false,
			});
			tok = this.advance();
		}
		this.tokens.defer(tok);
		this.expect("end-attributes");
		return attrs;
	},
};
