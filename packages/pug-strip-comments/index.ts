// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'error'.
const error = require("pug-error");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = stripComments;

function unexpectedToken(type: any, occasion: any, filename: any, line: any) {
	const msg = `\`${type}\` encountered when ${occasion}`;
	throw error("UNEXPECTED_TOKEN", msg, { filename, line });
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'stripComme... Remove this comment to see the full error message
function stripComments(input: any, options: any) {
	options = options || {};

	// Default: strip unbuffered comments and leave buffered ones alone
	const stripUnbuffered = options.stripUnbuffered !== false;
	const stripBuffered = options.stripBuffered === true;
	const filename = options.filename;

	// @ts-expect-error TS(6133): 'out' is declared but its value is never read.
	const out = [];
	// If we have encountered a comment token and are not sure if we have gotten
	// out of the comment or not
	let inComment = false;
	// If we are sure that we are in a block comment and all tokens except
	// `end-pipeless-text` should be ignored
	let inPipelessText = false;

	return input.filter((tok: any) => {
		switch (tok.type) {
			// @ts-expect-error TS(7029): Fallthrough case in switch.
			case "comment":
				if (inComment) {
					unexpectedToken("comment", "already in a comment", filename, tok.line);
				} else {
					inComment = tok.buffer ? stripBuffered : stripUnbuffered;
					return !inComment;
				}
			case "start-pipeless-text":
				if (!inComment) return true;
				if (inPipelessText) {
					unexpectedToken("start-pipeless-text", "already in pipeless text mode", filename, tok.line);
				}
				inPipelessText = true;
				return false;
			case "end-pipeless-text":
				if (!inComment) return true;
				if (!inPipelessText) {
					unexpectedToken("end-pipeless-text", "not in pipeless text mode", filename, tok.line);
				}
				inPipelessText = false;
				inComment = false;
				return false;
			// There might be a `text` right after `comment` but before
			// `start-pipeless-text`. Treat it accordingly.
			case "text":
				return !inComment;
			default:
				if (inPipelessText) return false;
				inComment = false;
				return true;
		}
	});
}
