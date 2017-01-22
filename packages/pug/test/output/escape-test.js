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
    pug_html = pug_html + "<!DOCTYPE html><html><head><title>escape-test</title></head><body><textarea>";
    var txt = '<param name="flashvars" value="a=&quot;value_a&quot;&b=&quot;value_b&quot;&c=3"/>';
    pug_html = pug_html + pug_escape(null == (pug_interp = txt) ? "" : pug_interp) + "</textarea></body></html>";
    return pug_html;
}