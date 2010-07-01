
/**
 * Module dependencies.
 */

var sys = require('sys'),
    jade = require('./../lib/jade');

jade.renderFile(__dirname + '/layout.jade', function(err, html){
    if (err) throw err;
    sys.puts('\x1b[1mlayout.jade:\x1b[0m', html, '');
});

var users = [
    { name: 'tj', roles: ['admin'] },
    { name: 'simon', roles: [] },
    { name: 'tobi', roles: ['manager'] }
];
jade.renderFile(__dirname + '/users.jade', { locals: { users: users }}, function(err, html){
    if (err) throw err;
    sys.puts('\x1b[1musers.jade:\x1b[0m', html, '');
});