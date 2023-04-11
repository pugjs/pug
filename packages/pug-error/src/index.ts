export default function makeError(
	code: string,
	message: string,
	options: { line: number; column: number; filename?: string; src?: string }
) {
	const line = options.line;
	const column = options.column;
	const filename = options.filename;
	const src = options.src;
	let fullMessage;
	const location = line + (column ? `:${column}` : "");
	if (src && line >= 1 && line <= src.split("\n").length) {
		const lines = src.split("\n");
		const start = Math.max(line - 3, 0);
		const end = Math.min(lines.length, line + 3);
		// Error context
		const context = lines
			.slice(start, end)
			.map((text, i) => {
				const curr = i + start + 1;
				const preamble = `${(curr == line ? "  > " : "    ") + curr}| `;
				let out = preamble + text;
				if (curr === line && column > 0) {
					out += "\n";
					out += `${Array(preamble.length + column).join("-")}^`;
				}
				return out;
			})
			.join("\n");
		fullMessage = `${filename || "Pug"}:${location}\n${context}\n\n${message}`;
	} else {
		fullMessage = `${filename || "Pug"}:${location}\n\n${message}`;
	}
	const err: any = new Error(fullMessage);
	err.code = `PUG:${code}`;
	err.msg = message;
	err.line = line;
	err.column = column;
	err.filename = filename;
	err.src = src;
	err.toJSON = function () {
		return {
			code: this.code,
			msg: this.msg,
			line: this.line,
			column: this.column,
			filename: this.filename,
		};
	};
	return err;
}

// Make this easier to use from CommonJS
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = makeError;
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.default = makeError;
