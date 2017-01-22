function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_mixins["article"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<article>";
        block && block();
        pug_html = pug_html + "</article>";
    };
    pug_html = pug_html + "<html><head><title>My Application</title></head><body>";
    pug_mixins["article"].call({
        block: function() {
            pug_html = pug_html + "<p>Hello World!</p>";
        }
    });
    pug_html = pug_html + "</body></html>";
    return pug_html;
}