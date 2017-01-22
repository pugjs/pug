function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_mixins["foo"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<p>bar</p>";
    };
    pug_mixins["foo"]();
    pug_html = pug_html + "<body><p>:)</p><script>\n  console.log(\"foo\\nbar\")\n</script><script type=\"text/javascript\">\nvar STRING_SUBSTITUTIONS = {    // table of character substitutions\n  '\\t': '\\\\t',\n  '\\r': '\\\\r',\n  '\\n': '\\\\n',\n  '\"' : '\\\\\"',\n  '\\\\': '\\\\\\\\'\n};\n</script></body>";
    return pug_html;
}