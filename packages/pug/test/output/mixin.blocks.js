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
    pug_mixins["form"] = pug_interp = function(method, action) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<form" + (pug_attr("method", method, true, false) + pug_attr("action", action, true, false)) + ">";
        var csrf_token_from_somewhere = "hey";
        pug_html = pug_html + "<input" + (' type="hidden" name="_csrf"' + pug_attr("value", csrf_token_from_somewhere, true, false)) + "/>";
        block && block();
        pug_html = pug_html + "</form>";
    };
    pug_html = pug_html + "<html><body>";
    pug_mixins["form"].call({
        block: function() {
            pug_html = pug_html + '<input type="text" name="query" placeholder="Search"/><input type="submit" value="Search"/>';
        }
    }, "GET", "/search");
    pug_html = pug_html + "</body></html><html><body>";
    pug_mixins["form"].call({
        block: function() {
            pug_html = pug_html + '<input type="text" name="query" placeholder="Search"/><input type="submit" value="Search"/>';
        }
    }, "POST", "/search");
    pug_html = pug_html + "</body></html><html><body>";
    pug_mixins["form"]("POST", "/search");
    pug_html = pug_html + "</body></html>";
    pug_mixins["bar"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<div id="bar">';
        block && block();
        pug_html = pug_html + "</div>";
    };
    pug_mixins["foo"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<div id="foo">';
        pug_mixins["bar"].call({
            block: function() {
                block && block();
            }
        });
        pug_html = pug_html + "</div>";
    };
    pug_mixins["foo"].call({
        block: function() {
            pug_html = pug_html + "<p>one</p><p>two</p><p>three</p>";
        }
    });
    pug_mixins["baz"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<div id="baz">';
        block && block();
        pug_html = pug_html + "</div>";
    };
    pug_mixins["baz"].call({
        block: function() {
            pug_html = pug_html + pug_escape(null == (pug_interp = "123") ? "" : pug_interp);
        }
    });
    return pug_html;
}