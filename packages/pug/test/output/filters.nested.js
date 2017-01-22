function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_html = pug_html + '<script><![CDATA[!function(){console.log("test")}();]]></script><script><![CDATA[(function(){!function(){return console.log("test")}()}).call(this);]]></script>';
    return pug_html;
}