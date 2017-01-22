function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + "<script>if (foo) {\n  bar();\n}</script><script>" + (null == (pug_interp = "foo()") ? "" : pug_interp) + "</script><script>foo()</script><script></script><div></div>";
    return pug_html;
}