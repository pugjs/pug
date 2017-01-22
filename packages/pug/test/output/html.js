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
    var version = 1449104952939;
    pug_html = pug_html + "<ul>\n<li>foo</li>\n<li>bar</li>\n<li>baz</li>\n</ul>\n<!--build:js /js/app.min.js?v=" + pug_escape(null == (pug_interp = version) ? "" : pug_interp) + "-->\n<!--endbuild--><p>You can <em>embed</em> html as well.</p><p><strong>Even</strong> as the body of a block expansion.</p>";
    return pug_html;
}