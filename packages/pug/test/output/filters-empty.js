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
    var users = [ {
        name: "tobi",
        age: 2
    } ];
    pug_html = pug_html + "<fb:users>";
    (function() {
        var $$obj = users;
        if ("number" == typeof $$obj.length) {
            for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
                var user = $$obj[pug_index0];
                pug_html = pug_html + "<fb:user" + pug_attr("age", user.age, true, false) + "><![CDATA[]]></fb:user>";
            }
        } else {
            var $$l = 0;
            for (var pug_index0 in $$obj) {
                $$l++;
                var user = $$obj[pug_index0];
                pug_html = pug_html + "<fb:user" + pug_attr("age", user.age, true, false) + "><![CDATA[]]></fb:user>";
            }
        }
    }).call(this);
    pug_html = pug_html + "</fb:users>";
    return pug_html;
}