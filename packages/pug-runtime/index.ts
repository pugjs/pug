const pug_has_own_property = Object.prototype.hasOwnProperty;

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.merge = pug_merge;
function pug_merge(a: any, b: any) {
	if (arguments.length === 1) {
		let attrs = a[0];
		for (let i = 1; i < a.length; i++) {
			attrs = pug_merge(attrs, a[i]);
		}
		return attrs;
	}

	for (const key in b) {
		if (key === "class") {
			var valA = a[key] || [];
			a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);
		} else if (key === "style") {
			// @ts-expect-error TS(2403): Subsequent variable declarations must have the sam... Remove this comment to see the full error message
			var valA = pug_style(a[key]);
			valA = valA && valA[valA.length - 1] !== ";" ? `${valA};` : valA;
			let valB = pug_style(b[key]);
			valB = valB && !valB.endsWith(";") ? `${valB};` : valB;
			a[key] = valA + valB;
		} else {
			a[key] = b[key];
		}
	}

	return a;
}

/**
 * Process array, object, or string as a string of classes delimited by a space.
 *
 * If `val` is an array, all members of it and its subarrays are counted as
 * classes. If `escaping` is an array, then whether or not the item in `val` is
 * escaped depends on the corresponding item in `escaping`. If `escaping` is
 * not an array, no escaping is done.
 *
 * If `val` is an object, all the keys whose value is truthy are counted as
 * classes. No escaping is done.
 *
 * If `val` is a string, it is counted as a class. No escaping is done.
 *
 * @param {(Array.<string>|Object.<string, boolean>|string)} val
 * @param {?Array.<string>} escaping
 * @return {String}
 */
// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.classes = pug_classes;
function pug_classes_array(val: any, escaping: any) {
	let classString = "",
		className,
		padding = "",
		escapeEnabled = Array.isArray(escaping);
	for (let i = 0; i < val.length; i++) {
		// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
		className = pug_classes(val[i]);
		if (!className) continue;
		escapeEnabled && escaping[i] && (className = pug_escape(className));
		classString = classString + padding + className;
		padding = " ";
	}
	return classString;
}
function pug_classes_object(val: any) {
	let classString = "",
		padding = "";
	for (const key in val) {
		if (key && val[key] && pug_has_own_property.call(val, key)) {
			classString = classString + padding + key;
			padding = " ";
		}
	}
	return classString;
}
function pug_classes(val: any, escaping: any) {
	if (Array.isArray(val)) {
		return pug_classes_array(val, escaping);
	} else if (val && typeof val === "object") {
		return pug_classes_object(val);
	}
	return val || "";
}

/**
 * Convert object or string to a string of CSS styles delimited by a semicolon.
 *
 * @param {(Object.<string, string>|string)} val
 * @return {String}
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.style = pug_style;
function pug_style(val: any) {
	if (!val) return "";
	if (typeof val === "object") {
		let out = "";
		for (const style in val) {
			/* istanbul ignore else */
			if (pug_has_own_property.call(val, style)) {
				out = `${out + style}:${val[style]};`;
			}
		}
		return out;
	}
	return `${val}`;
}

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.attr = pug_attr;
function pug_attr(key: any, val: any, escaped: any, terse: any) {
	if (val === false || val == null || (!val && (key === "class" || key === "style"))) {
		return "";
	}
	if (val === true) {
		return ` ${terse ? key : `${key}="${key}"`}`;
	}
	const type = typeof val;
	if ((type === "object" || type === "function") && typeof val.toJSON === "function") {
		val = val.toJSON();
	}
	if (typeof val !== "string") {
		val = JSON.stringify(val);
		if (!escaped && val.indexOf('"') !== -1) {
			return ` ${key}='${val.replace(/'/g, "&#39;")}'`;
		}
	}
	if (escaped) val = pug_escape(val);
	return ` ${key}="${val}"`;
}

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} terse whether to use HTML5 terse boolean attributes
 * @return {String}
 */
// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.attrs = pug_attrs;
function pug_attrs(obj: any, terse: any) {
	let attrs = "";

	for (const key in obj) {
		if (pug_has_own_property.call(obj, key)) {
			let val = obj[key];

			if ("class" === key) {
				// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
				val = pug_classes(val);
				attrs = pug_attr(key, val, false, terse) + attrs;
				continue;
			}
			if ("style" === key) {
				val = pug_style(val);
			}
			attrs += pug_attr(key, val, false, terse);
		}
	}

	return attrs;
}

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

const pug_match_html = /["&<>]/;
// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.escape = pug_escape;
function pug_escape(_html: any) {
	const html = `${_html}`;
	const regexResult = pug_match_html.exec(html);
	if (!regexResult) return _html;

	let result = "";
	let i, lastIndex, escape;
	for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
		switch (html.charCodeAt(i)) {
			case 34:
				escape = "&quot;";
				break;
			case 38:
				escape = "&amp;";
				break;
			case 60:
				escape = "&lt;";
				break;
			case 62:
				escape = "&gt;";
				break;
			default:
				continue;
		}
		if (lastIndex !== i) result += html.substring(lastIndex, i);
		lastIndex = i + 1;
		result += escape;
	}
	if (lastIndex !== i) return result + html.substring(lastIndex, i);
	return result;
}

/**
 * Re-throw the given `err` in context to the
 * the pug in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @param {String} str original source
 * @api private
 */

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.rethrow = pug_rethrow;
function pug_rethrow(err: any, filename: any, lineno: any, str: any) {
	if (!(err instanceof Error)) throw err;
	if ((typeof window != "undefined" || !filename) && !str) {
		err.message += ` on line ${lineno}`;
		throw err;
	}
	let context, lines, start: any, end;
	try {
		// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
		str = str || require("fs").readFileSync(filename, { encoding: "utf8" });
		context = 3;
		lines = str.split("\n");
		start = Math.max(lineno - context, 0);
		end = Math.min(lines.length, lineno + context);
	} catch (ex) {
		// @ts-expect-error TS(2571): Object is of type 'unknown'.
		err.message += ` - could not read from ${filename} (${ex.message})`;
		// @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
		pug_rethrow(err, null, lineno);
		return;
	}

	// Error context
	context = lines
		.slice(start, end)
		.map((line: any, i: any) => {
			const curr = i + start + 1;
			return `${(curr == lineno ? "  > " : "    ") + curr}| ${line}`;
		})
		.join("\n");

	// Alter exception message
	// @ts-expect-error TS(2339): Property 'path' does not exist on type 'Error'.
	err.path = filename;
	try {
		err.message = `${filename || "Pug"}:${lineno}\n${context}\n\n${err.message}`;
	} catch (e) {}
	throw err;
}
