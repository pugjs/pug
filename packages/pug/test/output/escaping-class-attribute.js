function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<foo attr="&lt;%= bar %&gt;"></foo><foo class="&lt;%= bar %&gt;"></foo><foo attr="<%= bar %>"></foo><foo class="<%= bar %>"></foo><foo class="<%= bar %> lol rofl"></foo><foo class="<%= bar %> lol rofl <%= lmao %>"></foo>';
    return pug_html;
}