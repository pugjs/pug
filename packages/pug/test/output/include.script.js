function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<script id="pet-template" type="text/x-template"><div class="pet"><h1>{{name}}</h1><p>{{name}} is a {{species}} that is {{age}} old</p></div></script>';
    return pug_html;
}