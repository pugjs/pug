function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<body><foo></foo><foo bar="baz"></foo><foo/><foo bar="baz"/><foo>/</foo><foo bar="baz">/</foo><foo/><foo bar="baz"/><foo>/</foo><foo bar="baz">/</foo><img/><img/><foo/></body>';
    return pug_html;
}