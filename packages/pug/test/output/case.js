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
    pug_html = pug_html + "<html><body>";
    var friends = 1;
    switch (friends) {
      case 0:
        pug_html = pug_html + "<p>you have no friends</p>";
        break;

      case 1:
        pug_html = pug_html + "<p>you have a friend</p>";
        break;

      default:
        pug_html = pug_html + "<p>you have " + pug_escape(null == (pug_interp = friends) ? "" : pug_interp) + " friends</p>";
        break;
    }
    var friends = 0;
    switch (friends) {
      case 0:
      case 1:
        pug_html = pug_html + "<p>you have very few friends</p>";
        break;

      default:
        pug_html = pug_html + "<p>you have " + pug_escape(null == (pug_interp = friends) ? "" : pug_interp) + " friends</p>";
        break;
    }
    var friend = "Tim:G";
    switch (friend) {
      case "Tim:G":
        pug_html = pug_html + "<p>Friend is a string</p>";
        break;

      case {
            tim: "g"
        }:
        pug_html = pug_html + "<p>Friend is an object</p>";
        break;
    }
    pug_html = pug_html + "</body></html>";
    return pug_html;
}