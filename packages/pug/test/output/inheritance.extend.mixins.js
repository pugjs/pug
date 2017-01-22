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
    pug_mixins["article"] = pug_interp = function(title) {
        var block = this && this.block, attributes = this && this.attributes || {};
        if (title) {
            pug_html = pug_html + "<h1>" + pug_escape(null == (pug_interp = title) ? "" : pug_interp) + "</h1>";
        }
        block && block();
    };
    pug_html = pug_html + "<html><head><title>My Application</title></head><body>";
    pug_mixins["article"].call({
        block: function() {
            pug_html = pug_html + "<p>Foo bar baz!</p>";
        }
    }, "The meaning of life");
    pug_html = pug_html + "</body></html>";
    return pug_html;
}