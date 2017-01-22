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
    pug_mixins["list"] = pug_interp = function(tag) {
        var block = this && this.block, attributes = this && this.attributes || {};
        var items = [];
        for (pug_interp = 1; pug_interp < arguments.length; pug_interp++) {
            items.push(arguments[pug_interp]);
        }
        pug_html = pug_html + "<" + tag + ">";
        (function() {
            var $$obj = items;
            if ("number" == typeof $$obj.length) {
                for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
                    var item = $$obj[pug_index0];
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = item) ? "" : pug_interp) + "</li>";
                }
            } else {
                var $$l = 0;
                for (var pug_index0 in $$obj) {
                    $$l++;
                    var item = $$obj[pug_index0];
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = item) ? "" : pug_interp) + "</li>";
                }
            }
        }).call(this);
        pug_html = pug_html + "</" + tag + ">";
    };
    pug_mixins["list"]("ul", 1, 2, 3, 4);
    return pug_html;
}