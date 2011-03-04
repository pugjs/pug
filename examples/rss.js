
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

jade.renderFile(__dirname + '/rss.jade', function(err, xml){
  if (err) throw err;
  console.log(xml);
});