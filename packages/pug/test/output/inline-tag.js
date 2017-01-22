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
    pug_html = pug_html + "<p>bing <strong>foo</strong> bong</p><p>bing\n<strong>foo</strong>\n<strong>" + pug_escape(null == (pug_interp = "[foo]") ? "" : pug_interp) + "</strong>\n";
    var foo = "foo]";
    pug_html = pug_html + "\nbong\n</p><p>bing\n<strong>foo</strong>\n<strong>" + pug_escape(null == (pug_interp = "[foo]") ? "" : pug_interp) + "</strong>\n";
    var foo = "foo]";
    pug_html = pug_html + "\nbong</p><p>#[strong escaped]\n#[<strong>escaped</strong></p>";
    return pug_html;
}