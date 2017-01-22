function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_mixins["m"] = pug_interp = function(id) {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<div>";
        block && block();
        pug_html = pug_html + "</div>";
    };
    pug_mixins["m"].call({
        block: function() {
            pug_html = pug_html + "This text should appear";
        }
    });
    return pug_html;
}