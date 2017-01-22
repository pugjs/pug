function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    var ajax = true;
    if (ajax) {
        pug_html = pug_html + "<p>ajax contents</p>";
    } else {
        pug_html = pug_html + '<!DOCTYPE html><html><head><meta charset="utf8"><title>sample</title><body><p>all contetns</p></body></head></html>';
    }
    return pug_html;
}