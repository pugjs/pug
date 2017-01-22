function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + "<!-- foo--><ul><!-- bar--><li>one</li><!-- baz--><li>two</li></ul><!--ul\n  li foo\n--><!-- block// inline follow\nli three\n--><!-- block// inline followed by tags\nul\n  li four\n--><!--if IE lt 9// inline\nscript(src='/lame.js')\n// end-inline\n--><p>five</p><div class=\"foo\">// not a comment</div>";
    return pug_html;
}