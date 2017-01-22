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

function pug_merge(r, e) {
    if (1 === arguments.length) {
        for (var t = r[0], a = 1; a < r.length; a++) t = pug_merge(t, r[a]);
        return t;
    }
    for (var g in e) if ("class" === g) {
        var l = r[g] || [];
        r[g] = (Array.isArray(l) ? l : [ l ]).concat(e[g] || []);
    } else if ("style" === g) {
        var l = pug_style(r[g]), n = pug_style(e[g]);
        r[g] = l + (l && n && ";") + n;
    } else r[g] = e[g];
    return r;
}

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
    pug_mixins["centered"] = pug_interp = function(title) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<div" + (' class="centered"' + pug_attr("id", attributes.id, true, false)) + ">";
        if (title) {
            pug_html = pug_html + "<h1" + pug_attr("class", pug_classes([ attributes.class ], [ true ]), false, false) + ">" + pug_escape(null == (pug_interp = title) ? "" : pug_interp) + "</h1>";
        }
        block && block();
        if (attributes.href) {
            pug_html = pug_html + '<div class="footer"><a' + pug_attr("href", attributes.href, true, false) + ">Back</a></div>";
        }
        pug_html = pug_html + "</div>";
    };
    pug_mixins["main"] = pug_interp = function(title) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<div class="stretch">';
        pug_mixins["centered"].call({
            block: function() {
                block && block();
            },
            attributes: pug_merge([ {
                class: "highlight"
            }, attributes ])
        }, title);
        pug_html = pug_html + "</div>";
    };
    pug_mixins["bottom"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<div" + pug_attrs(pug_merge([ {
            class: "bottom"
        }, attributes ]), false) + ">";
        block && block();
        pug_html = pug_html + "</div>";
    };
    pug_html = pug_html + "<body>";
    pug_mixins["centered"].call({
        block: function() {
            pug_html = pug_html + "Hello World";
        },
        attributes: {
            id: "First"
        }
    });
    pug_mixins["centered"].call({
        block: function() {
            pug_html = pug_html + "<p>Some important content.</p>";
        },
        attributes: {
            id: "Second"
        }
    }, "Section 1");
    pug_mixins["centered"].call({
        block: function() {
            pug_html = pug_html + "<p>Even more important content.</p>";
        },
        attributes: {
            class: "foo bar",
            id: "Third",
            href: "menu.html"
        }
    }, "Section 2");
    pug_mixins["main"].call({
        block: function() {
            pug_html = pug_html + "<p>Last content.</p>";
        },
        attributes: {
            href: "#"
        }
    }, "Section 3");
    pug_mixins["bottom"].call({
        block: function() {
            pug_html = pug_html + "<p>Some final words.</p>";
        },
        attributes: {
            class: "foo bar",
            name: "end",
            id: "Last",
            "data-attr": "baz"
        }
    });
    pug_mixins["bottom"].call({
        attributes: {
            class: "class1 class2"
        }
    });
    pug_html = pug_html + "</body>";
    pug_mixins["foo"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<div" + pug_attrs(pug_merge([ {
            class: "thing",
            attr1: "foo",
            attr2: "bar"
        }, attributes ]), false) + "></div>";
    };
    var val = "<biz>";
    var classes = [ "foo", "bar" ];
    pug_mixins["foo"].call({
        attributes: {
            class: pug_classes([ classes, "thunk" ], [ true, false ]),
            attr3: "baz",
            "data-foo": pug_escape(val),
            "data-bar": val
        }
    });
    pug_mixins["work_filmstrip_item"] = pug_interp = function(work) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<div" + pug_attrs(attributes, false) + ">" + pug_escape(null == (pug_interp = work) ? "" : pug_interp) + "</div>";
    };
    pug_mixins["work_filmstrip_item"].call({
        attributes: {
            "data-profile": "profile",
            "data-creator-name": "name"
        }
    }, "work");
    pug_mixins["my-mixin"] = pug_interp = function(arg1, arg2, arg3, arg4) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<p>" + pug_escape(null == (pug_interp = arg1) ? "" : pug_interp) + "</p><p>" + pug_escape(null == (pug_interp = arg2) ? "" : pug_interp) + "</p><p>" + pug_escape(null == (pug_interp = arg3) ? "" : pug_interp) + "</p><p>" + pug_escape(null == (pug_interp = arg4) ? "" : pug_interp) + "</p>";
    };
    pug_mixins["foo"].call({
        attributes: {
            class: "baz",
            attr3: "qux"
        }
    });
    pug_mixins["my-mixin"]("1", "2", "3", "4");
    return pug_html;
}