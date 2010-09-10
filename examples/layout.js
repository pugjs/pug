
/**
 * Module dependencies.
 */

var sys = require('sys'),
    jade = require('./../lib/jade');

jade.renderFile(__dirname + '/layout.jade', function(err, html){
    if (err) throw err;
    sys.puts('\x1b[1mlayout.jade:\x1b[0m', html, '');
});