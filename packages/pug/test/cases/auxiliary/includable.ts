// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'STRING_SUB... Remove this comment to see the full error message
const STRING_SUBSTITUTIONS = {
	// table of character substitutions
	"\t": "\\t",
	"\r": "\\r",
	"\n": "\\n",
	'"': '\\"',
	"\\": "\\\\",
};
