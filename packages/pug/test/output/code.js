function pug_attr(t, e, n, f) {
    return e !== !1 && null != e && (e || "class" !== t && "style" !== t) ? e === !0 ? " " + (f ? t : t + '="' + t + '"') : ("function" == typeof e.toJSON && (e = e.toJSON()), 
    "string" == typeof e || (e = JSON.stringify(e), n || e.indexOf('"') === -1) ? (n && (e = pug_escape(e)), 
    " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'") : "";
}

function pug_escape(e) {
    var a = "" + e, t = pug_match_html.exec(a);
    if (!t) return e;
    var r, c, n, s = "";
    for (r = t.index, c = 0; r < a.length; r++) {
        switch (a.charCodeAt(r)) {
          case 34:
            n = "&quot;";
            break;

          case 38:
            n = "&amp;";
            break;

          case 60:
            n = "&lt;";
            break;

          case 62:
            n = "&gt;";
            break;

          default:
            continue;
        }
        c !== r && (s += a.substring(c, r)), c = r + 1, s += n;
    }
    return c !== r ? s + a.substring(c, r) : s;
}

var pug_match_html = /["&<>]/;

function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + "<p>" + pug_escape(null == (pug_interp = null) ? "" : pug_interp) + "</p><p>" + pug_escape(null == (pug_interp = undefined) ? "" : pug_interp) + "</p><p>" + pug_escape(null == (pug_interp = "") ? "" : pug_interp) + "</p><p>" + pug_escape(null == (pug_interp = 0) ? "" : pug_interp) + "</p><p>" + pug_escape(null == (pug_interp = false) ? "" : pug_interp) + "</p><p></p><p" + pug_attr("foo", undefined, true, false) + '></p><p foo=""></p><p foo="0"></p><p></p>';
    return pug_html;
}