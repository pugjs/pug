
/**
 * Module dependencies.
 */

var jade = require('./../')
  , path = __dirname + '/mixins.jade'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = jade.compile(str, { filename: path, pretty: true });

var user = {
    name: 'tj'
  , pets: ['tobi', 'loki', 'jane', 'manny']
};

console.log(fn({ user: user }));