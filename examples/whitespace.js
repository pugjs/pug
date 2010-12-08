
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

jade.renderFile(__dirname + '/whitespace.jade', {debug:true},function(err, html){
    if (err) throw err;
    console.log(html);
});