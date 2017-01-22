function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + "<html><body><p>Just <em>some</em> markdown <strong>tests</strong>.</p>\n<p>With new line.</p>\n<script>(function(){var n;n={square:function(n){return n*n}}}).call(this);</script><script>(function() {\n  var math;\n\n  math = {\n    square: function(value) {\n      return value * value;\n    }\n  };\n\n}).call(this);\n</script></body></html>";
    return pug_html;
}