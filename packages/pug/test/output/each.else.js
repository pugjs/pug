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
    (function(Object, val) {
        var users = [];
        pug_html = pug_html + "<ul>";
        (function() {
            var $$obj = users;
            if ("number" == typeof $$obj.length) {
                if ($$obj.length) {
                    for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
                        var user = $$obj[pug_index0];
                        pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = user.name) ? "" : pug_interp) + "</li>";
                    }
                } else {
                    pug_html = pug_html + "<li>no users!</li>";
                }
            } else {
                var $$l = 0;
                for (var pug_index0 in $$obj) {
                    $$l++;
                    var user = $$obj[pug_index0];
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = user.name) ? "" : pug_interp) + "</li>";
                }
                if ($$l === 0) {
                    pug_html = pug_html + "<li>no users!</li>";
                }
            }
        }).call(this);
        pug_html = pug_html + "</ul>";
        var users = [ {
            name: "tobi",
            friends: [ "loki" ]
        }, {
            name: "loki"
        } ];
        if (users) {
            pug_html = pug_html + "<ul>";
            (function() {
                var $$obj = users;
                if ("number" == typeof $$obj.length) {
                    if ($$obj.length) {
                        for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
                            var user = $$obj[pug_index1];
                            pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = user.name) ? "" : pug_interp) + "</li>";
                        }
                    } else {
                        pug_html = pug_html + "<li>no users!</li>";
                    }
                } else {
                    var $$l = 0;
                    for (var pug_index1 in $$obj) {
                        $$l++;
                        var user = $$obj[pug_index1];
                        pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = user.name) ? "" : pug_interp) + "</li>";
                    }
                    if ($$l === 0) {
                        pug_html = pug_html + "<li>no users!</li>";
                    }
                }
            }).call(this);
            pug_html = pug_html + "</ul>";
        }
        var user = {
            name: "tobi",
            age: 10
        };
        pug_html = pug_html + "<ul>";
        (function() {
            var $$obj = user;
            if ("number" == typeof $$obj.length) {
                if ($$obj.length) {
                    for (var key = 0, $$l = $$obj.length; key < $$l; key++) {
                        var val = $$obj[key];
                        pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = key) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = val) ? "" : pug_interp) + "</li>";
                    }
                } else {
                    pug_html = pug_html + "<li>user has no details!</li>";
                }
            } else {
                var $$l = 0;
                for (var key in $$obj) {
                    $$l++;
                    var val = $$obj[key];
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = key) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = val) ? "" : pug_interp) + "</li>";
                }
                if ($$l === 0) {
                    pug_html = pug_html + "<li>user has no details!</li>";
                }
            }
        }).call(this);
        pug_html = pug_html + "</ul>";
        var user = {};
        pug_html = pug_html + "<ul>";
        (function() {
            var $$obj = user;
            if ("number" == typeof $$obj.length) {
                if ($$obj.length) {
                    for (var key = 0, $$l = $$obj.length; key < $$l; key++) {
                        var prop = $$obj[key];
                        pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = key) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = val) ? "" : pug_interp) + "</li>";
                    }
                } else {
                    pug_html = pug_html + "<li>user has no details!</li>";
                }
            } else {
                var $$l = 0;
                for (var key in $$obj) {
                    $$l++;
                    var prop = $$obj[key];
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = key) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = val) ? "" : pug_interp) + "</li>";
                }
                if ($$l === 0) {
                    pug_html = pug_html + "<li>user has no details!</li>";
                }
            }
        }).call(this);
        pug_html = pug_html + "</ul>";
        var user = Object.create(null);
        user.name = "tobi";
        pug_html = pug_html + "<ul>";
        (function() {
            var $$obj = user;
            if ("number" == typeof $$obj.length) {
                if ($$obj.length) {
                    for (var key = 0, $$l = $$obj.length; key < $$l; key++) {
                        var val = $$obj[key];
                        pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = key) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = val) ? "" : pug_interp) + "</li>";
                    }
                } else {
                    pug_html = pug_html + "<li>user has no details!</li>";
                }
            } else {
                var $$l = 0;
                for (var key in $$obj) {
                    $$l++;
                    var val = $$obj[key];
                    pug_html = pug_html + "<li>" + pug_escape(null == (pug_interp = key) ? "" : pug_interp) + ": " + pug_escape(null == (pug_interp = val) ? "" : pug_interp) + "</li>";
                }
                if ($$l === 0) {
                    pug_html = pug_html + "<li>user has no details!</li>";
                }
            }
        }).call(this);
        pug_html = pug_html + "</ul>";
    }).call(this, "Object" in locals_for_with ? locals_for_with.Object : typeof Object !== "undefined" ? Object : undefined, "val" in locals_for_with ? locals_for_with.val : typeof val !== "undefined" ? val : undefined);
    return pug_html;
}