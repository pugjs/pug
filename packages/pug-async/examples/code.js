
/**
 * Module dependencies.
 */

var pug = require('../')
  , path = __dirname + '/code.pug'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = pug.compile(str, { filename: path, pretty: true });

var users = {
  tj: { age: 23, email: 'tj@vision-media.ca', isA: 'human' },
  tobi: { age: 1, email: 'tobi@is-amazing.com', isA: 'ferret' }
};

console.log(fn({ users: users }));