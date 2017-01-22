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
    var locals_for_with = locals || {};
    (function(title) {
        pug_mixins["foo"] = pug_interp = function() {
            var block = this && this.block, attributes = this && this.attributes || {};
            pug_html = pug_html + "<h1>" + pug_escape(null == (pug_interp = title) ? "" : pug_interp) + "</h1>";
        };
        pug_html = pug_html + "<html><body>";
        pug_mixins["foo"]();
        pug_html = pug_html + "</body></html>";
    }).call(this, "title" in locals_for_with ? locals_for_with.title : typeof title !== "undefined" ? title : undefined);
    return pug_html;
}