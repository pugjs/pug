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
    pug_mixins["comment"] = pug_interp = function(title, str) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<div class="comment"><h2>' + pug_escape(null == (pug_interp = title) ? "" : pug_interp) + '</h2><p class="body">' + pug_escape(null == (pug_interp = str) ? "" : pug_interp) + "</p></div>";
    };
    pug_mixins["comment"] = pug_interp = function(title, str) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<div class="comment"><h2>' + pug_escape(null == (pug_interp = title) ? "" : pug_interp) + '</h2><p class="body">' + pug_escape(null == (pug_interp = str) ? "" : pug_interp) + "</p></div>";
    };
    pug_html = pug_html + '<div id="user"><h1>Tobi</h1><div class="comments">';
    pug_mixins["comment"]("This", "is regular, javascript");
    pug_html = pug_html + "</div></div>";
    pug_mixins["list"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<ul><li>foo</li><li>bar</li><li>baz</li></ul>";
    };
    pug_html = pug_html + "<body>";
    pug_mixins["list"]();
    pug_mixins["list"]();
    pug_html = pug_html + "</body>";
    pug_mixins["foobar"] = pug_interp = function(str) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<div id="interpolation">' + pug_escape(null == (pug_interp = str + "interpolated") ? "" : pug_interp) + "</div>";
    };
    var suffix = "bar";
    pug_mixins["foo" + suffix]("This is ");
    return pug_html;
}