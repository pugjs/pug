function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<script type="text/x-template"><div id="user-<%= user.id %>"><h1><%= user.title %></h1></div></script>';
    return pug_html;
}