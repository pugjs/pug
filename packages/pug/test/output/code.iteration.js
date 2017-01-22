function pug_attr(t, e, n, f) {
    return e !== !1 && null != e && (e || "class" !== t && "style" !== t) ? e === !0 ? " " + (f ? t : t + '="' + t + '"') : ("function" == typeof e.toJSON && (e = e.toJSON()), 
    "string" == typeof e || (e = JSON.stringify(e), n || e.indexOf('"') === -1) ? (n && (e = pug_escape(e)), 
    " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'") : "";
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

function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    var items = [ 1, 2, 3 ];
    pug_html = pug_html + "<ul>";
    items.forEach(function(item) {
        {
            pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = item) ? "" : pug_interp) + "</li>";
        }
    });
    pug_html = pug_html + "</ul>";
    var items = [ 1, 2, 3 ];
    pug_html = pug_html + "<ul>";
    (function() {
        var $$obj = items;
        if ("number" == typeof $$obj.length) {
            for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
                var item = $$obj[i];
                pug_html = pug_html + "<li" + pug_attr("class", pug_classes([ "item-" + i ], [ true ]), false, false) + ">" + pug_escape(null == (pug_interp = item) ? "" : pug_interp) + "</li>";
            }
        } else {
            var $$l = 0;
            for (var i in $$obj) {
                $$l++;
                var item = $$obj[i];
                pug_html = pug_html + "<li" + pug_attr("class", pug_classes([ "item-" + i ], [ true ]), false, false) + ">" + pug_escape(null == (pug_interp = item) ? "" : pug_interp) + "</li>";
            }
        }
    }).call(this);
    pug_html = pug_html + "</ul><ul>";
    (function() {
        var $$obj = items;
        if ("number" == typeof $$obj.length) {
            for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
                var item = $$obj[i];
                pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = item) ? "" : pug_interp) + "</li>";
            }
        } else {
            var $$l = 0;
            for (var i in $$obj) {
                $$l++;
                var item = $$obj[i];
                pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = item) ? "" : pug_interp) + "</li>";
            }
        }
    }).call(this);
    pug_html = pug_html + "</ul><ul>";
    (function() {
        var $$obj = items;
        if ("number" == typeof $$obj.length) {
            for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {
                var $item = $$obj[pug_index2];
                pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = $item) ? "" : pug_interp) + "</li>";
            }
        } else {
            var $$l = 0;
            for (var pug_index2 in $$obj) {
                $$l++;
                var $item = $$obj[pug_index2];
                pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = $item) ? "" : pug_interp) + "</li>";
            }
        }
    }).call(this);
    pug_html = pug_html + "</ul>";
    var nums = [ 1, 2, 3 ];
    var letters = [ "a", "b", "c" ];
    pug_html = pug_html + "<ul>";
    (function() {
        var $$obj = letters;
        if ("number" == typeof $$obj.length) {
            for (var pug_index3 = 0, $$l = $$obj.length; pug_index3 < $$l; pug_index3++) {
                var l = $$obj[pug_index3];
                (function() {
                    var $$obj = nums;
                    if ("number" == typeof $$obj.length) {
                        for (var pug_index4 = 0, $$l = $$obj.length; pug_index4 < $$l; pug_index4++) {
                            var n = $$obj[pug_index4];
                            pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = n) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = l) ? "" : pug_interp) + "</li>";
                        }
                    } else {
                        var $$l = 0;
                        for (var pug_index4 in $$obj) {
                            $$l++;
                            var n = $$obj[pug_index4];
                            pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = n) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = l) ? "" : pug_interp) + "</li>";
                        }
                    }
                }).call(this);
            }
        } else {
            var $$l = 0;
            for (var pug_index3 in $$obj) {
                $$l++;
                var l = $$obj[pug_index3];
                (function() {
                    var $$obj = nums;
                    if ("number" == typeof $$obj.length) {
                        for (var pug_index5 = 0, $$l = $$obj.length; pug_index5 < $$l; pug_index5++) {
                            var n = $$obj[pug_index5];
                            pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = n) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = l) ? "" : pug_interp) + "</li>";
                        }
                    } else {
                        var $$l = 0;
                        for (var pug_index5 in $$obj) {
                            $$l++;
                            var n = $$obj[pug_index5];
                            pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = n) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = l) ? "" : pug_interp) + "</li>";
                        }
                    }
                }).call(this);
            }
        }
    }).call(this);
    pug_html = pug_html + "</ul>";
    var count = 1;
    var counter = function() {
        return [ count++, count++, count++ ];
    };
    pug_html = pug_html + "<ul>";
    (function() {
        var $$obj = counter();
        if ("number" == typeof $$obj.length) {
            for (var pug_index6 = 0, $$l = $$obj.length; pug_index6 < $$l; pug_index6++) {
                var n = $$obj[pug_index6];
                pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = n) ? "" : pug_interp) + "</li>";
            }
        } else {
            var $$l = 0;
            for (var pug_index6 in $$obj) {
                $$l++;
                var n = $$obj[pug_index6];
                pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = n) ? "" : pug_interp) + "</li>";
            }
        }
    }).call(this);
    pug_html = pug_html + "</ul>";
    return pug_html;
}