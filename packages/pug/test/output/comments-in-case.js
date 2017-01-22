function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + "<!DOCTYPE html><html><body>";
    var s = "this";
    switch (s) {
      case "this":
        pug_html = pug_html + "<p>It's this!</p>";
        break;

      case "that":
        pug_html = pug_html + "<p>It's that!</p>";
        break;
    }
    pug_html = pug_html + "</body></html>";
    return pug_html;
}