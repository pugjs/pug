// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'runtime'.
const runtime = require("./");

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = wrap;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'wrap'.
function wrap(template: any, templateName: any) {
	templateName = templateName || "template";
	return Function("pug", `${template}\n` + `return ${templateName};`)(runtime);
}
