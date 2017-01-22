function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<script id="user-template" type="text/template"><div id="user"><h1><%= user.name %></h1><p><%= user.description %></p></div></script><script id="user-template" type="text/template">if (foo) {\n  bar();\n}</script>';
    return pug_html;
}