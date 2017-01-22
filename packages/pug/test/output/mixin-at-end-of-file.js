function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_mixins["slide"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + '<section class="slide">';
        block && block();
        pug_html = pug_html + "</section>";
    };
    pug_mixins["slide"].call({
        block: function() {
            pug_html = pug_html + "<p>some awesome content</p>";
        }
    });
    return pug_html;
}