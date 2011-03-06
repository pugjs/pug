
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
   * Transform sass to css, wrapped in style tags.
   */
  
  sass: function(str){
    str = str.replace(/\\n/g, '\n');
    var sass = require('sass').render(str).replace(/\n/g, '\\n');
    return '<style>' + sass + '</style>'; 
  },
  
  /**
   * Transform stylus to css, wrapped in style tags.
   */
  
  stylus: function(str){
    var ret;
    str = str.replace(/\\n/g, '\n');
    var stylus = require('stylus');
    stylus(str).render(function(err, css){
      if (err) throw err;
      ret = css.replace(/\n/g, '\\n');
    });
    return '<style>' + ret + '</style>'; 
  },
  
  /**
   * Transform sass to css, wrapped in style tags.
   */
  
  less: function(str){
    var ret;
    str = str.replace(/\\n/g, '\n');
    require('less').render(str, function(err, css){
      if (err) throw err;
      ret = '<style>' + css.replace(/\n/g, '\\n') + '</style>';  
    });
    return ret;
  },
  
  /**
   * Transform markdown to html.
   */
  
  markdown: function(str){
    var md = markdown_library();
    str = str.replace(/\\n/g, '\n');
    return md.parse(str).replace(/\n/g, '\\n').replace(/'/g,'&#39;');
  },
  
  /**
   * Transform markdown to html.
   */
  
  discount: function(str){
    var md = require('discount');
    str = str.replace(/\\n/g, '\n');
    return md.parse(str).replace(/\n/g, '\\n').replace(/'/g,'&#39;');
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

// Find a markdown library, if installed
//
// If we find a library, cache the result so we don't have to
// require() (potentially) multiple times each call. However,
// if we don't find it, we'll keep trying and throw()ing.
var markdown_library = function() {
  function find_markdown() {
    // "expensive" calculation
    try {
      return require('markdown');
    } catch (e) { try {
      return require('discount');
    } catch (e2) { try {
      return require('markdown-js');
    } catch (e3) {
      // this error will get reached each time we call and don't find markdown
      throw Error('Could not find any markdown modules. Install discount or markdown-js.');
    }}}
  }

  markdown_library = (function(md) {
    return function() { return md; };
  })(find_markdown());
  return markdown_library();

}
