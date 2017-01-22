function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    if (true) {
        pug_html = pug_html + "<p>foo</p>";
    } else {
        pug_html = pug_html + "<p>bar</p>";
    }
    if (true) {
        {
            pug_html = pug_html + "<p>foo</p>";
        }
    } else {
        {
            pug_html = pug_html + "<p>bar</p>";
        }
    }
    if (true) {
        pug_html = pug_html + "<p>foo</p><p>bar</p><p>baz</p>";
    } else {
        pug_html = pug_html + "<p>bar</p>";
    }
    if (!true) {
        pug_html = pug_html + "<p>foo</p>";
    } else {
        pug_html = pug_html + "<p>bar</p>";
    }
    if ("nested") {
        if ("works") {
            pug_html = pug_html + "<p>yay</p>";
        }
    }
    if (false) {} else {
        pug_html = pug_html + '<div class="bar"></div>';
    }
    if (true) {
        pug_html = pug_html + '<div class="bar"></div>';
    }
    pug_html = pug_html + '<div class="bing"></div>';
    if (false) {
        pug_html = pug_html + '<div class="bing"></div>';
    } else if (false) {
        pug_html = pug_html + '<div class="bar"></div>';
    } else {
        pug_html = pug_html + '<div class="foo"></div>';
    }
    return pug_html;
}