
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var user = {
    name: 'tj'
  , pets: ['tobi', 'loki', 'jane', 'manny']
};

var options = { locals: { user: user }};

jade.renderFile(__dirname + '/mixins.jade', options, function(err, html){
  if (err) throw err;
  console.log(html);
});