function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<a class="foo bar baz"></a><a class="foo bar baz"></a><a class="foo-bar_baz"></a><a class="foo baz"></a>';
    return pug_html;
}