function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<html><body><head><script src="/jquery.js"></script><script src="/caustic.js"></script><script src="/app.js"></script>';
    if (false) {
        pug_html = pug_html + '<script src="/jquery.ui.js"></script>';
    }
    pug_html = pug_html + "</head></body></html>";
    return pug_html;
}