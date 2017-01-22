function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + "<html><body><pre>BEGINhtml\n  body\n    pre\n      include:custom(opt='val' num=2) filters.include.custom.pug\nEND</pre></body></html>";
    return pug_html;
}