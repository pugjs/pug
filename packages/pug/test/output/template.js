function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<script type="text/x-template"><article><h2>{{title}}</h2><p>{{description}}</p></article></script><script type="text/x-template">article\n  h2 {{title}}\n  p {{description}}</script>';
    return pug_html;
}