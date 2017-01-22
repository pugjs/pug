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
    (function(list, string) {
        list = [ "uno", "dos", "tres", "cuatro", "cinco", "seis" ];
        (function() {
            var $$obj = list;
            if ("number" == typeof $$obj.length) {
                for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
                    var item = $$obj[pug_index0];
                    string = item.charAt(0).toUpperCase() + item.slice(1);
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = string) ? "" : pug_interp) + "</li>";
                }
            } else {
                var $$l = 0;
                for (var pug_index0 in $$obj) {
                    $$l++;
                    var item = $$obj[pug_index0];
                    string = item.charAt(0).toUpperCase() + item.slice(1);
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = string) ? "" : pug_interp) + "</li>";
                }
            }
        }).call(this);
    }).call(this, "list" in locals_for_with ? locals_for_with.list : typeof list !== "undefined" ? list : undefined, "string" in locals_for_with ? locals_for_with.string : typeof string !== "undefined" ? string : undefined);
    return pug_html;
}