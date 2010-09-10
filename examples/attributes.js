
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var options = { locals: { name: 'tj' }};
jade.renderFile(__dirname + '/attributes.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});