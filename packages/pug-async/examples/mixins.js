
/**
 * Module dependencies.
 */

var pug = require('../')
  , path = __dirname + '/mixins.pug'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = pug.compile(str, { filename: path, pretty: true });

var user = {
    name: 'tj'
  , pets: ['tobi', 'loki', 'jane', 'manny']
};

console.log(fn({ user: user }));