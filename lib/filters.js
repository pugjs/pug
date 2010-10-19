
/*!
 * Jade - filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = {
    
    /**
     * Wrap text with CDATA block.
     */
    
    cdata: function(str){
        return '<![CDATA[\\n' + str + '\\n]]>';
    },
    
    /**
     * Wrap text with script and CDATA tags.
     */
    
    javascript: function(str){
        return '<script type="text/javascript">\\n' + str + '</script>';
    },
    
    /**
     * Transform sass to css, wrapped in style tags.
     */
    
    sass: function(str){
        str = str.replace(/\\n/g, '\n');
        var sass = require('sass').render(str).replace(/\n/g, '\\n');
        return '<style>' + sass + '</style>'; 
    },
    
    /**
     * Transform sass to css, wrapped in style tags.
     */
    
    less: function(str){
        var less;
        str = str.replace(/\\n/g, '\n');
        require('less').render(str, function(err, css){
            less = '<style>' + css.replace(/\n/g, '\\n') + '</style>';  
        });
        return less;
    },
    
    /**
     * Transform markdown to html.
     */
    
    markdown: function(str){
        var md = require('markdown');
        str = str.replace(/\\n/g, '\n');
        return (md.toHTML
            ? md.toHTML(str)
            : md.parse(str)).replace(/\n/g, '\\n').replace(/'/g,'&#39;');
    },

    /**
     * Transform coffeescript to javascript.
     */

    coffeescript: function(str){
        str = str.replace(/\\n/g, '\n');
        var js = require('coffee-script').compile(str).replace(/\n/g, '\\n');
        return '<script type="text/javascript">\\n' + js + '</script>';
    }
};