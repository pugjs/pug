
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

jade.renderFile(__dirname + '/mixins.jade', function(err, html){
  if (err) throw err;
  console.log(html);
});