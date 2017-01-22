function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_mixins["bang"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_mixins["foo"]();
    };
    pug_mixins["foo"] = pug_interp = function() {
        var block = this && this.block, attributes = this && this.attributes || {};
        pug_html = pug_html + "<p>bar</p>";
    };
    pug_mixins["bang"]();
    return pug_html;
}