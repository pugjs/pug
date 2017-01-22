function pug_attr(t, e, n, f) {
    return e !== !1 && null != e && (e || "class" !== t && "style" !== t) ? e === !0 ? " " + (f ? t : t + '="' + t + '"') : ("function" == typeof e.toJSON && (e = e.toJSON()), 
    "string" == typeof e || (e = JSON.stringify(e), n || e.indexOf('"') === -1) ? (n && (e = pug_escape(e)), 
    " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'") : "";
}

function pug_attrs(t, r) {
    var a = "";
    for (var s in t) if (pug_has_own_property.call(t, s)) {
        var u = t[s];
        if ("class" === s) {
            u = pug_classes(u), a = pug_attr(s, u, !1, r) + a;
            continue;
        }
        "style" === s && (u = pug_style(u)), a += pug_attr(s, u, !1, r);
    }
    return a;
}

function pug_classes(s, r) {
    return Array.isArray(s) ? pug_classes_array(s, r) : s && "object" == typeof s ? pug_classes_object(s) : s || "";
}

function pug_classes_array(r, a) {
    for (var s, e = "", u = "", c = Array.isArray(a), g = 0; g < r.length; g++) s = pug_classes(r[g]), 
    s && (c && a[g] && (s = pug_escape(s)), e = e + u + s, u = " ");
    return e;
}

function pug_classes_object(r) {
    var a = "", n = "";
    for (var o in r) o && r[o] && pug_has_own_property.call(r, o) && (a = a + n + o, 
    n = " ");
    return a;
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

var pug_has_own_property = Object.prototype.hasOwnProperty;

var pug_match_html = /["&<>]/;

function pug_style(r) {
    if (!r) return "";
    if ("object" == typeof r) {
        var e = "", t = "";
        for (var n in r) pug_has_own_property.call(r, n) && (e = e + t + n + ":" + r[n], 
        t = ";");
        return e;
    }
    return r = "" + r, ";" === r[r.length - 1] ? r.slice(0, -1) : r;
}

function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    var tag = "p";
    var foo = "bar";
    pug_html = pug_html + "<" + tag + ">value</" + tag + "><" + tag + ' foo="bar">value</' + tag + "><" + (foo ? "a" : "li") + ' something="something">here</' + (foo ? "a" : "li") + ">";
    pug_mixins["item"] = pug_interp = function(icon) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<li>";
        if (attributes.href) {
            pug_html = pug_html + "<a" + pug_attrs(attributes, false) + "><img" + (' class="icon"' + pug_attr("src", icon, true, false)) + "/>";
            block && block();
            pug_html = pug_html + "</a>";
        } else {
            pug_html = pug_html + "<span" + pug_attrs(attributes, false) + "><img" + (' class="icon"' + pug_attr("src", icon, true, false)) + "/>";
            block && block();
            pug_html = pug_html + "</span>";
        }
        pug_html = pug_html + "</li>";
    };
    pug_html = pug_html + "<ul>";
    pug_mixins["item"].call({
        block: function() {
            pug_html = pug_html + "Contact";
        }
    }, "contact");
    pug_mixins["item"].call({
        block: function() {
            pug_html = pug_html + "Contact";
        },
        attributes: {
            href: "/contact"
        }
    });
    pug_html = pug_html + "</ul>";
    return pug_html;
}