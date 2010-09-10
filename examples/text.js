
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var options = { locals: { name: 'tj', email: 'tj@vision-media.ca' }};
jade.renderFile(__dirname + '/text.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});