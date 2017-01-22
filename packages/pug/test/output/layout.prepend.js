function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<html><script src="foo.js"></script><script src="bar.js"></script><script src="app.js"></script><script src="vendor/jquery.js"></script><script src="vendor/caustic.js"></script><body></body></html>';
    return pug_html;
}