
/**
 * Module dependencies.
 */

var sys = require('sys'),
    jade = require('./../lib/jade');

jade.renderFile(__dirname + '/layout.jade', { debug: true }, function(err, html){
    if (err) throw err;
    sys.puts(html);
});